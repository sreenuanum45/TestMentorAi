import { NextRequest, NextResponse } from "next/server";
import { groqChat, type GroqMessage } from "@/lib/groq";
import {
  buildMockInterviewerPrompt,
  pickRandomTheme,
  type MockDifficulty,
} from "@/lib/prompts/mockInterviewer";
import { getCurrentUser } from "@/lib/auth";
import { insertMessage } from "@/lib/repo";

const VALID_DIFFICULTIES: MockDifficulty[] = ["Friendly", "Standard", "Tough"];

interface MockChatRequest {
  messages: GroqMessage[];
  role: string;
  experience: string;
  focus: string;
  numQuestions?: number;
  difficulty?: MockDifficulty;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const {
      messages,
      role,
      experience,
      focus,
      numQuestions: rawNumQuestions,
      difficulty: rawDifficulty,
    } = (await req.json()) as MockChatRequest;

    if (!role || !experience || !focus) {
      return NextResponse.json(
        { error: "role, experience, and focus are required" },
        { status: 400 }
      );
    }
    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: "messages must be an array" }, { status: 400 });
    }

    const numQuestions = Math.min(Math.max(Math.trunc(rawNumQuestions ?? 5), 1), 15);
    const difficulty = VALID_DIFFICULTIES.includes(rawDifficulty as MockDifficulty)
      ? (rawDifficulty as MockDifficulty)
      : "Standard";

    // The opening kickoff turn is just the hidden "I'm ready" message — seed a
    // random theme for Question 1 so different sessions don't converge on the
    // same generic opener. Later turns rely on conversation history instead.
    const isOpeningTurn = messages.length === 1;
    const systemPrompt = buildMockInterviewerPrompt(
      role,
      experience,
      focus,
      numQuestions,
      difficulty,
      isOpeningTurn ? pickRandomTheme() : undefined
    );
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMessage) {
      await insertMessage(user.sub, "MOCK", "user", lastUserMessage.content);
    }

    // Higher temperature than the Study Companion — question variety matters
    // more here than strict format adherence.
    const reply = await groqChat([{ role: "system", content: systemPrompt }, ...messages], 0.9);
    await insertMessage(user.sub, "MOCK", "assistant", reply);
    return NextResponse.json({ reply });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
