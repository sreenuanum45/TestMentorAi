import { NextRequest, NextResponse } from "next/server";
import { groqChat } from "@/lib/groq";
import { extractJson } from "@/lib/json";
import { RESUME_REVIEW_PROMPT } from "@/lib/prompts/resumeReview";
import { getCurrentUser } from "@/lib/auth";

export interface ResumeReviewResult {
  score: number;
  summary: string;
  strengths: string[];
  issues: { issue: string; severity: "high" | "medium" | "low"; suggestion: string }[];
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { resumeText } = (await req.json()) as { resumeText?: string };
    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json(
        { error: "Paste more of your resume text (at least a few sentences)." },
        { status: 400 }
      );
    }

    const raw = await groqChat(
      [
        { role: "system", content: RESUME_REVIEW_PROMPT },
        { role: "user", content: resumeText.slice(0, 12000) },
      ],
      0.4,
      true
    );

    const result = extractJson<ResumeReviewResult>(raw);
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
