"use client";

import { useRef, useState } from "react";
import { Check, Copy, FileDown, Mail, Paperclip, Sparkles } from "lucide-react";
import { readFileAsBase64 } from "@/lib/file";
import { downloadCoverLetterPdf } from "@/lib/pdf";
import PageHero from "@/components/PageHero";

const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export default function CoverLetterPage() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [letter, setLetter] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
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
    setLetter(null);
    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setLetter(data.letter);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!letter) return;
    try {
      await navigator.clipboard.writeText(letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard access denied — non-critical convenience
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <PageHero
        icon={Mail}
        eyebrow="Get The Job"
        title="Cover Letter Generator"
        description="Paste your resume and the job description — get a tailored cover letter draft that ties your real experience to what they're asking for."
        tagline="Every Application, Personalized."
        color="violet"
      />

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800 sm:p-6">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium">Your resume</label>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                className="hidden"
                id="cover-letter-upload"
              />
              <label
                htmlFor="cover-letter-upload"
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 px-3 py-1 text-xs hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                <Paperclip className="h-3 w-3" aria-hidden />
                Upload PDF/DOCX
              </label>
              {extracting && <span className="text-xs text-neutral-400">Extracting…</span>}
            </div>
          </div>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={7}
            placeholder="Paste your resume text here, or upload a PDF/DOCX above…"
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Job description</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={7}
            placeholder="Paste the job posting you're applying to…"
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <button
          type="submit"
          disabled={loading || resumeText.trim().length < 50 || jobDescription.trim().length < 30}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.01] disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" aria-hidden />
          {loading ? "Drafting…" : "Generate cover letter"}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {letter && (
        <div className="mt-6 rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800 sm:p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Your draft</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium dark:border-neutral-700"
              >
                {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                type="button"
                onClick={() => downloadCoverLetterPdf(letter)}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium dark:border-neutral-700"
              >
                <FileDown className="h-3.5 w-3.5" aria-hidden />
                PDF
              </button>
            </div>
          </div>
          <p className="whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300">{letter}</p>
        </div>
      )}
    </div>
  );
}
