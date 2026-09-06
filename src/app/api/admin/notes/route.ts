import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { listNotes, createNote } from "@/lib/repo";
import { embedText } from "@/lib/embeddings";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const notes = await listNotes();
  return NextResponse.json({ notes });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { title, content } = (await req.json()) as { title?: string; content?: string };
    if (!title || !content) {
      return NextResponse.json({ error: "title and content are required" }, { status: 400 });
    }

    let embedding: string | null = null;
    try {
      embedding = JSON.stringify(await embedText(content));
    } catch (err) {
      console.error("Failed to compute embedding for new note, will backfill on next query:", err);
    }

    const note = await createNote(title, content, embedding);
    return NextResponse.json({ note });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
