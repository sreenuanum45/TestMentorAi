"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, ClipboardList, Mic, Trash2, type LucideIcon } from "lucide-react";
import type { BookmarkRow, BookmarkModule } from "@/lib/repo";

const MODULE_META: Record<BookmarkModule, { label: string; icon: LucideIcon }> = {
  STUDY: { label: "Study Companion", icon: BookOpen },
  MOCK: { label: "Mock Interviewer", icon: Mic },
  EXAM: { label: "Timed Exam", icon: ClipboardList },
};

const FILTERS: { key: "all" | BookmarkModule; label: string }[] = [
  { key: "all", label: "All" },
  { key: "STUDY", label: "Study" },
  { key: "MOCK", label: "Mock" },
  { key: "EXAM", label: "Exam" },
];

export default function SavedItemsList({ bookmarks }: { bookmarks: BookmarkRow[] }) {
  const [items, setItems] = useState(bookmarks);
  const [filter, setFilter] = useState<"all" | BookmarkModule>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = filter === "all" ? items : items.filter((b) => b.module === filter);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/bookmarks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setItems((prev) => prev.filter((b) => b.id !== id));
    } catch {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
              filter === f.key
                ? "border-rose-600 bg-rose-600 text-white"
                : "border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-neutral-400">
          Nothing saved here yet — hover over an answer in Study Companion or Mock Interviewer, or an
          exam result, and click Save.
        </p>
      )}

      <div className="space-y-3">
        {filtered.map((b) => {
          const meta = MODULE_META[b.module];
          return (
            <div key={b.id} className="rounded-xl border border-neutral-200 p-4 text-sm dark:border-neutral-800">
              <div className="mb-1 flex items-center justify-between gap-2 text-xs text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <meta.icon className="h-3.5 w-3.5" aria-hidden />
                  {meta.label} · {new Date(b.created_at).toLocaleDateString()}
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(b.id)}
                  disabled={deletingId === b.id}
                  className="text-neutral-400 hover:text-red-500 disabled:opacity-50"
                  aria-label="Delete saved item"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
              <p className="font-medium">{b.question}</p>
              {b.answer && (
                <p className="mt-1 line-clamp-6 whitespace-pre-wrap text-neutral-500">{b.answer}</p>
              )}
              {b.module === "STUDY" && (
                <Link
                  href={`/study?q=${encodeURIComponent(b.question)}`}
                  className="mt-2 inline-block text-primary hover:underline dark:text-indigo-400"
                >
                  Practice again →
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
