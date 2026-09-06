import { NextRequest, NextResponse } from "next/server";
import { groqChat } from "@/lib/groq";
import { geminiGenerate } from "@/lib/gemini";
import { extractJson } from "@/lib/json";
import { LOCATOR_SANDBOX_PROMPT } from "@/lib/prompts/locatorSandbox";
import { getCurrentUser } from "@/lib/auth";

export interface LocatorSandboxResult {
  findings: { element: string; badLocator: string; goodLocator: string; reasoning: string }[];
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { html, image } = (await req.json()) as {
      html?: string;
      image?: { mimeType: string; data: string } | null;
    };

    if (!html?.trim() && !image) {
      return NextResponse.json(
        { error: "Paste HTML markup or attach a screenshot" },
        { status: 400 }
      );
    }

    let raw: string;
    if (image) {
      raw = await geminiGenerate(
        LOCATOR_SANDBOX_PROMPT,
        html?.trim() || "Analyze this screenshot for interactive elements and locators.",
        image
      );
    } else {
      raw = await groqChat(
        [
          { role: "system", content: LOCATOR_SANDBOX_PROMPT },
          { role: "user", content: html!.slice(0, 12000) },
        ],
        0.3,
        true
      );
    }

    const result = extractJson<LocatorSandboxResult>(raw);
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
