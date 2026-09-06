import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateNote, deleteNote } from "@/lib/repo";
import { embedText } from "@/lib/embeddings";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const { title, content } = (await req.json()) as { title?: string; content?: string };

    let embedding: string | null | undefined;
    if (content) {
      try {
        embedding = JSON.stringify(await embedText(content));
      } catch (err) {
        console.error("Failed to recompute embedding on note update:", err);
      }
    }

    await updateNote(id, { title, content, embedding });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  await deleteNote(id);
  return NextResponse.json({ ok: true });
}
