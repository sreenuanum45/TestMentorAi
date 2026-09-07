import { NextRequest, NextResponse } from "next/server";
import { groqChat } from "@/lib/groq";
import { COVER_LETTER_PROMPT } from "@/lib/prompts/coverLetter";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { resumeText, jobDescription } = (await req.json()) as {
      resumeText?: string;
      jobDescription?: string;
    };
    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json(
        { error: "Paste more of your resume text (at least a few sentences)." },
        { status: 400 }
      );
    }
    if (!jobDescription || jobDescription.trim().length < 30) {
      return NextResponse.json(
        { error: "Paste the job description you're applying to." },
        { status: 400 }
      );
    }

    const letter = await groqChat(
      [
        { role: "system", content: COVER_LETTER_PROMPT },
        {
          role: "user",
          content: `RESUME:\n${resumeText.slice(0, 10000)}\n\nJOB DESCRIPTION:\n${jobDescription.slice(0, 6000)}`,
        },
      ],
      0.6,
      false
    );

    return NextResponse.json({ letter: letter.trim() });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
