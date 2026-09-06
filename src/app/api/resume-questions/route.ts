import { NextRequest, NextResponse } from "next/server";
import { groqChat } from "@/lib/groq";
import { extractJson } from "@/lib/json";
import { RESUME_QUESTIONS_PROMPT } from "@/lib/prompts/resumeQuestions";
import { getCurrentUser } from "@/lib/auth";

export interface ResumeQuestionsResult {
  skills: { skill: string; questions: { text: string; difficulty: "Junior" | "Mid" | "Senior" }[] }[];
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { resumeText } = (await req.json()) as { resumeText?: string };
    if (!resumeText || resumeText.trim().length < 20) {
      return NextResponse.json(
        { error: "Paste more of your resume text (at least a couple of sentences)." },
        { status: 400 }
      );
    }

    const raw = await groqChat(
      [
        { role: "system", content: RESUME_QUESTIONS_PROMPT },
        { role: "user", content: resumeText.slice(0, 12000) },
      ],
      0.4,
      true
    );

    const result = extractJson<ResumeQuestionsResult>(raw);
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
