"use client";

import { useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, FileSearch, Paperclip, Sparkles } from "lucide-react";
import type { ResumeReviewResult } from "@/app/api/resume-review/route";
import { readFileAsBase64 } from "@/lib/file";
import PageHero from "@/components/PageHero";

const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const SEVERITY_STYLES: Record<string, string> = {
  high: "border-red-200 dark:border-red-900",
  medium: "border-amber-200 dark:border-amber-900",
  low: "border-neutral-200 dark:border-neutral-800",
};

const SEVERITY_BADGE: Record<string, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  low: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
};

function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-500";
  if (score >= 50) return "text-amber-500";
  return "text-red-500";
}

export default function ResumeReviewPage() {
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResumeReviewResult | null>(null);
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
      const res = await fetch("/api/resume-review", {
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
        icon={FileSearch}
        eyebrow="Get The Job"
        title="Resume Reviewer"
        description="Paste or upload your resume for an AI-driven score, strengths, and specific fixes for weak bullets, missing metrics, and ATS-formatting issues."
        tagline="Sharper Resume. Stronger First Impression."
        color="cyan"
      />

      <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800 sm:p-6">
        <div className="mb-2 flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            className="hidden"
            id="resume-review-upload"
          />
          <label
            htmlFor="resume-review-upload"
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
          rows={10}
          placeholder="Paste your full resume text here, or upload a PDF/DOCX above…"
          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={loading || resumeText.trim().length < 50}
          className="mt-3 flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.01] disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" aria-hidden />
          {loading ? "Reviewing…" : "Review my resume"}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {result && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center gap-4 rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
            <div className={`text-4xl font-bold ${scoreColor(result.score)}`}>{result.score}</div>
            <p className="text-sm text-neutral-500">{result.summary}</p>
          </div>

          {result.strengths.length > 0 && (
            <div>
              <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden />
                Strengths
              </h2>
              <ul className="space-y-2">
                {result.strengths.map((s, i) => (
                  <li
                    key={i}
                    className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.issues.length > 0 && (
            <div>
              <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden />
                Issues to fix
              </h2>
              <div className="space-y-3">
                {result.issues.map((iss, i) => (
                  <div key={i} className={`rounded-lg border p-4 text-sm ${SEVERITY_STYLES[iss.severity] ?? ""}`}>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="font-medium">{iss.issue}</p>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${SEVERITY_BADGE[iss.severity] ?? ""}`}
                      >
                        {iss.severity}
                      </span>
                    </div>
                    <p className="text-neutral-500">{iss.suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
