import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { deleteUserNote, updateUserNote } from "@/lib/repo";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const { title, content } = (await req.json()) as { title?: string; content?: string };
    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "title and content are required" }, { status: 400 });
    }

    await updateUserNote(id, user.sub, { title: title.trim(), content: content.trim() });
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
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await deleteUserNote(id, user.sub);
  return NextResponse.json({ ok: true });
}
