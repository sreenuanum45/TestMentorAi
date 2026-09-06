import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createExam, type ExamFormat, type ExamQuestionResult } from "@/lib/repo";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { format, focus, breakdown } = (await req.json()) as {
      format?: ExamFormat;
      focus?: string;
      breakdown?: ExamQuestionResult[];
    };

    if (format !== "MCQ" && format !== "SHORT_ANSWER") {
      return NextResponse.json({ error: "format must be MCQ or SHORT_ANSWER" }, { status: 400 });
    }
    if (!focus?.trim() || !Array.isArray(breakdown) || breakdown.length === 0) {
      return NextResponse.json({ error: "focus and breakdown are required" }, { status: 400 });
    }

    const score = breakdown.reduce((acc, q) => acc + q.score, 0);
    const total = breakdown.reduce((acc, q) => acc + q.maxScore, 0);

    const exam = await createExam(user.sub, format, focus, score, total, breakdown);
    return NextResponse.json({ exam });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
