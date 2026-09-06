import { NextRequest, NextResponse } from "next/server";
import { groqChat } from "@/lib/groq";
import { extractJson } from "@/lib/json";
import { SHORT_ANSWER_GRADING_PROMPT } from "@/lib/prompts/exam";
import { getCurrentUser } from "@/lib/auth";
import { createExam, type ExamQuestionResult } from "@/lib/repo";

interface GradeRequest {
  focus?: string;
  questions?: string[];
  answers?: string[];
}

interface GradeResult {
  score: number;
  feedback: string;
  modelAnswer: string;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { focus, questions, answers } = (await req.json()) as GradeRequest;
    if (!focus?.trim() || !Array.isArray(questions) || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "focus, questions, and answers are required" },
        { status: 400 }
      );
    }
    if (questions.length !== answers.length) {
      return NextResponse.json(
        { error: "questions and answers must be the same length" },
        { status: 400 }
      );
    }

    const transcript = questions
      .map((q, i) => `Q${i + 1}: ${q}\nCandidate answer: ${answers[i]?.trim() || "(blank)"}`)
      .join("\n\n");

    const raw = await groqChat(
      [
        { role: "system", content: SHORT_ANSWER_GRADING_PROMPT },
        { role: "user", content: transcript },
      ],
      0.3,
      true
    );
    const { results } = extractJson<{ results: GradeResult[] }>(raw);

    const breakdown: ExamQuestionResult[] = questions.map((question, i) => ({
      question,
      userAnswer: answers[i],
      score: Math.min(Math.max(results[i]?.score ?? 0, 0), 5),
      maxScore: 5,
      feedback: results[i]?.feedback ?? "",
      modelAnswer: results[i]?.modelAnswer ?? "",
    }));

    const score = breakdown.reduce((acc, q) => acc + q.score, 0);
    const total = breakdown.reduce((acc, q) => acc + q.maxScore, 0);

    const exam = await createExam(user.sub, "SHORT_ANSWER", focus, score, total, breakdown);
    return NextResponse.json({ exam });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
