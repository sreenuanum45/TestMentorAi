import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createBookmark, listBookmarksForUser, type BookmarkModule } from "@/lib/repo";

const VALID_MODULES: BookmarkModule[] = ["STUDY", "MOCK", "EXAM"];

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const bookmarks = await listBookmarksForUser(user.sub);
  return NextResponse.json({ bookmarks });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { module: bookmarkModule, question, answer } = (await req.json()) as {
      module?: string;
      question?: string;
      answer?: string | null;
    };

    if (!bookmarkModule || !VALID_MODULES.includes(bookmarkModule as BookmarkModule)) {
      return NextResponse.json({ error: "Invalid module" }, { status: 400 });
    }
    if (!question || !question.trim()) {
      return NextResponse.json({ error: "question is required" }, { status: 400 });
    }

    const bookmark = await createBookmark(
      user.sub,
      bookmarkModule as BookmarkModule,
      question.trim(),
      answer?.trim() || null
    );
    return NextResponse.json({ bookmark });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
