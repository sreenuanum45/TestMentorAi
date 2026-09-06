import { NextRequest, NextResponse } from "next/server";
import { groqChat, type GroqMessage } from "@/lib/groq";
import { geminiGenerate } from "@/lib/gemini";
import { STUDY_COMPANION_PROMPT } from "@/lib/prompts/studyCompanion";
import { retrieveContext } from "@/lib/rag";
import { getCurrentUser } from "@/lib/auth";
import { insertMessage } from "@/lib/repo";

interface StudyChatRequest {
  messages: GroqMessage[];
  image?: { mimeType: string; data: string } | null;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { messages, image } = (await req.json()) as StudyChatRequest;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages is required" }, { status: 400 });
    }

    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    const context = lastUserMessage ? await retrieveContext(lastUserMessage.content) : [];
    const contextBlock = context.length
      ? `\n\nRelevant notes from the candidate's uploaded materials (prefer these over general knowledge when they conflict):\n${context
          .map((c) => `--- ${c.title} ---\n${c.snippet}`)
          .join("\n\n")}`
      : "";

    const systemPrompt = STUDY_COMPANION_PROMPT + contextBlock;

    if (lastUserMessage) {
      await insertMessage(user.sub, "STUDY", "user", lastUserMessage.content);
    }

    let reply: string;
    if (image) {
      reply = await geminiGenerate(
        systemPrompt,
        lastUserMessage?.content ?? "Analyze this image.",
        image
      );
    } else {
      reply = await groqChat([{ role: "system", content: systemPrompt }, ...messages]);
    }

    await insertMessage(user.sub, "STUDY", "assistant", reply);
    return NextResponse.json({ reply });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
