"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { FileText, Paperclip, Sparkles } from "lucide-react";
import type { ResumeQuestionsResult } from "@/app/api/resume-questions/route";
import { readFileAsBase64 } from "@/lib/file";
import PageHero from "@/components/PageHero";

const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

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
  const [extracting, setExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setExtracting(true);
    setError(null);
    try {
      const { mimeType, data } = await readFileAsBase64(file);
      const isPdf = mimeType === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      const isDocx = mimeType === DOCX_MIME || file.name.toLowerCase().endsWith(".docx");
      if (!isPdf && !isDocx) {
        throw new Error("Only PDF and DOCX files are supported — paste the text instead.");
      }
      const res = await fetch("/api/resume-questions/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileBase64: data, mimeType: isPdf ? "application/pdf" : DOCX_MIME }),
      });
      const extracted = await res.json();
      if (!res.ok) throw new Error(extracted.error || "Failed to read file");
      setResumeText(extracted.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

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
      <PageHero
        icon={FileText}
        eyebrow="Personalized Prep"
        title="Resume-to-Question Generator"
        description="Paste your resume text (or the skills section). We'll pull out the QA tools you listed and build a targeted question bank — click any question to drill it in the Study Companion."
        tagline="Your Resume. Your Questions."
        color="violet"
      />

      <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800 sm:p-6">
        <div className="mb-2 flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            className="hidden"
            id="resume-file-upload"
          />
          <label
            htmlFor="resume-file-upload"
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            <Paperclip className="h-3.5 w-3.5" aria-hidden />
            Upload PDF/DOCX
          </label>
          {extracting && <span className="text-sm text-neutral-400">Extracting text…</span>}
        </div>
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          rows={8}
          placeholder="Paste your resume text here, or upload a PDF/DOCX above…"
          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-3 flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.01] disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" aria-hidden />
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
