import { NextRequest, NextResponse } from "next/server";
import { groqChat } from "@/lib/groq";
import { extractJson } from "@/lib/json";
import { buildMcqExamPrompt, buildShortAnswerExamPrompt } from "@/lib/prompts/exam";
import { getCurrentUser } from "@/lib/auth";
import type { ExamFormat } from "@/lib/repo";

export interface McqQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ShortAnswerQuestion {
  question: string;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { format, focus, numQuestions } = (await req.json()) as {
      format?: ExamFormat;
      focus?: string;
      numQuestions?: number;
    };

    if (format !== "MCQ" && format !== "SHORT_ANSWER") {
      return NextResponse.json({ error: "format must be MCQ or SHORT_ANSWER" }, { status: 400 });
    }
    if (!focus?.trim()) {
      return NextResponse.json({ error: "focus is required" }, { status: 400 });
    }
    const count = Math.min(Math.max(Math.trunc(numQuestions ?? 10), 3), 25);

    const prompt =
      format === "MCQ"
        ? buildMcqExamPrompt(focus, count)
        : buildShortAnswerExamPrompt(focus, count);

    const raw = await groqChat([{ role: "system", content: prompt }], 0.7, true);
    const result = extractJson<{ questions: McqQuestion[] | ShortAnswerQuestion[] }>(raw);
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
