import { fetchWithRetry } from "@/lib/retry";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
// Note: the architecture doc specified "Llama 3.3 70B", but that model is no
// longer served on this account's Groq catalog (checked via GET /openai/v1/models).
// openai/gpt-oss-120b is the closest available large general-purpose chat model.
const GROQ_MODEL = "openai/gpt-oss-120b";

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function groqChat(
  messages: GroqMessage[],
  temperature = 0.6,
  jsonMode = false
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set on the server");
  }

  const res = await fetchWithRetry(
    GROQ_API_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature,
        ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
    },
    "Groq"
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const reply = data?.choices?.[0]?.message?.content;
  if (typeof reply !== "string") {
    throw new Error("Groq API returned an unexpected response shape");
  }
  return reply;
}
