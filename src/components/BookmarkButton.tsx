"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import type { BookmarkModule } from "@/lib/repo";

export default function BookmarkButton({
  module: bookmarkModule,
  question,
  answer,
  className,
}: {
  module: BookmarkModule;
  question: string;
  answer?: string | null;
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function handleSave() {
    if (state === "saving" || state === "saved") return;
    setState("saving");
    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module: bookmarkModule, question, answer }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setState("saved");
    } catch {
      setState("error");
    }
  }

  if (state === "saved") {
    return (
      <span className={`flex items-center gap-1 text-xs text-primary dark:text-indigo-400 ${className ?? ""}`}>
        <BookmarkCheck className="h-3 w-3" aria-hidden />
        Saved
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSave}
      disabled={state === "saving"}
      className={`flex items-center gap-1 text-xs text-neutral-400 transition-opacity hover:text-neutral-600 disabled:opacity-60 dark:hover:text-neutral-300 ${className ?? ""}`}
    >
      <Bookmark className="h-3 w-3" aria-hidden />
      {state === "saving" ? "Saving…" : state === "error" ? "Retry save" : "Save"}
    </button>
  );
}
