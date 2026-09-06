import { fetchWithRetry } from "@/lib/retry";

// "gemini-flash-latest" currently resolves to a model that returned repeated
// 503 (high demand) errors on vision requests during testing; the lite alias
// was stable and is plenty fast for this use case.
const GEMINI_MODEL = "gemini-flash-lite-latest";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export interface GeminiImagePart {
  mimeType: string;
  /** base64-encoded image data, without the `data:` URL prefix */
  data: string;
}

export async function geminiGenerate(
  systemPrompt: string,
  userText: string,
  image?: GeminiImagePart
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set on the server");
  }

  const parts: Record<string, unknown>[] = [
    { text: `${systemPrompt}\n\n---\n\nCandidate message:\n${userText}` },
  ];
  if (image) {
    parts.push({ inline_data: { mime_type: image.mimeType, data: image.data } });
  }

  const res = await fetchWithRetry(
    GEMINI_API_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": apiKey,
      },
      body: JSON.stringify({ contents: [{ parts }] }),
    },
    "Gemini"
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof reply !== "string") {
    throw new Error("Gemini API returned an unexpected response shape");
  }
  return reply;
}

// Image generation is gated behind billing on the Gemini API (confirmed via a
// live 429 RESOURCE_EXHAUSTED with limit:0 on the free tier) — no amount of
// retrying fixes that, so this deliberately skips fetchWithRetry's backoff.
const IMAGE_MODEL = "gemini-2.5-flash-image";
const IMAGE_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:generateContent`;

export interface GeneratedImage {
  mimeType: string;
  /** base64-encoded image data, without the `data:` URL prefix */
  data: string;
}

interface InlineDataPart {
  inlineData?: { mimeType?: string; mime_type?: string; data: string };
  inline_data?: { mimeType?: string; mime_type?: string; data: string };
}

export async function generateImage(prompt: string): Promise<GeneratedImage> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set on the server");

  const res = await fetch(IMAGE_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-goog-api-key": apiKey },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });

  if (!res.ok) {
    const errText = await res.text();
    if (res.status === 429 && /RESOURCE_EXHAUSTED/.test(errText)) {
      throw new Error(
        "Image generation isn't enabled on this Gemini API project — the free tier has a 0 quota for image models. Enable billing at https://aistudio.google.com to use this."
      );
    }
    throw new Error(`Gemini image API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const parts: InlineDataPart[] = data?.candidates?.[0]?.content?.parts ?? [];
  const inline = parts.map((p) => p.inlineData ?? p.inline_data).find((d) => d?.data);
  if (!inline) throw new Error("Gemini did not return an image for this prompt");
  return { mimeType: inline.mimeType ?? inline.mime_type ?? "image/png", data: inline.data };
}
