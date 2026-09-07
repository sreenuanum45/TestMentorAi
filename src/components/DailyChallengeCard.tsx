"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Flame } from "lucide-react";
import type { DailyChallengeQuestion } from "@/lib/dailyChallenge";

export default function DailyChallengeCard({
  question,
  completedToday,
  streak,
}: {
  question: DailyChallengeQuestion;
  completedToday: boolean;
  streak: number;
}) {
  const [completed, setCompleted] = useState(completedToday);
  const [saving, setSaving] = useState(false);

  async function handleComplete() {
    if (completed || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/daily-challenge/complete", { method: "POST" });
      if (!res.ok) throw new Error();
      setCompleted(true);
    } catch {
      // leave the button active so the user can retry
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800 sm:p-6">
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700 dark:bg-orange-950/50 dark:text-orange-300">
          {question.category}
        </span>
        <div className="flex items-center gap-1.5 text-sm font-medium text-orange-500">
          <Flame className="h-4 w-4" aria-hidden />
          {streak} day streak
        </div>
      </div>

      <p className="text-lg font-medium">{question.question}</p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleComplete}
          disabled={completed || saving}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition-transform disabled:opacity-100 ${
            completed
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
              : "bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:scale-[1.01]"
          }`}
        >
          <Check className="h-4 w-4" aria-hidden />
          {completed ? "Completed today" : saving ? "Saving…" : "Mark as answered"}
        </button>
        <Link
          href={`/study?q=${encodeURIComponent(question.question)}`}
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium dark:border-neutral-700"
        >
          Discuss in Study Companion
        </Link>
      </div>
    </div>
  );
}
