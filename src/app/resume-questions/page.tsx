"use client";

import { useState } from "react";
import Link from "next/link";
import type { ResumeQuestionsResult } from "@/app/api/resume-questions/route";

const DIFFICULTY_STYLES: Record<string, string> = {
  Junior: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  Mid: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  Senior: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export default function ResumeQuestionsPage() {
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResumeQuestionsResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/resume-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <h1 className="text-xl font-semibold">Resume-to-Question Generator</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Paste your resume text (or the skills section). We&apos;ll pull out the QA tools you
        listed and build a targeted question bank — click any question to drill it in the Study
        Companion.
      </p>

      <form onSubmit={handleSubmit} className="mt-6">
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          rows={8}
          placeholder="Paste your resume text here…"
          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Analyzing…" : "Generate questions"}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {result && result.skills.length === 0 && (
        <p className="mt-6 text-sm text-neutral-400">
          No recognizable QA tools found — try pasting more of your experience/skills section.
        </p>
      )}

      <div className="mt-8 space-y-6">
        {result?.skills.map((s) => (
          <div key={s.skill}>
            <h2 className="mb-2 text-sm font-semibold">{s.skill}</h2>
            <div className="space-y-2">
              {s.questions.map((q) => (
                <Link
                  key={q.text}
                  href={`/study?q=${encodeURIComponent(q.text)}`}
                  className="flex items-start justify-between gap-3 rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900"
                >
                  <span>{q.text}</span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${DIFFICULTY_STYLES[q.difficulty] ?? ""}`}
                  >
                    {q.difficulty}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
