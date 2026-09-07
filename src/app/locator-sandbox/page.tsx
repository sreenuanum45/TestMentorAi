"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Paperclip, Search, XCircle } from "lucide-react";
import { readImageFile, type ReadImageResult } from "@/lib/image";
import type { LocatorSandboxResult } from "@/app/api/locator-sandbox/route";
import PageHero from "@/components/PageHero";

export default function LocatorSandboxPage() {
  const [html, setHtml] = useState("");
  const [pendingImage, setPendingImage] = useState<ReadImageResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LocatorSandboxResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingImage(await readImageFile(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!html.trim() && !pendingImage) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/locator-sandbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          html,
          image: pendingImage
            ? { mimeType: pendingImage.mimeType, data: pendingImage.data }
            : null,
        }),
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
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <PageHero
        icon={Search}
        eyebrow="Automation Skill"
        title="DOM / Locator Sandbox"
        description="Paste a raw HTML snippet, or attach a UI screenshot / DOM inspector screenshot. We'll flag fragile selectors and suggest self-healing replacements."
        tagline="Build Locators That Last."
        color="rose"
      />

      <form onSubmit={handleSubmit} className="mt-6 space-y-3 rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800 sm:p-6">
        <textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          rows={8}
          placeholder='e.g. <button class="btn primary-8f3a1">Submit</button>'
          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="sandbox-image-upload"
          />
          <label
            htmlFor="sandbox-image-upload"
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            <Paperclip className="h-3.5 w-3.5" aria-hidden />
            Attach screenshot
          </label>
          {pendingImage && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pendingImage.previewUrl} alt="Pending attachment" className="h-8 w-8 rounded object-cover" />
              <button
                type="button"
                onClick={() => {
                  setPendingImage(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-sm text-red-500 hover:underline"
              >
                Remove
              </button>
            </>
          )}
          <button
            type="submit"
            disabled={loading}
            className="ml-auto flex items-center gap-2 rounded-lg bg-gradient-to-r from-rose-500 to-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.01] disabled:opacity-50"
          >
            <Search className="h-4 w-4" aria-hidden />
            {loading ? "Analyzing…" : "Audit locators"}
          </button>
        </div>
      </form>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {result && result.findings.length === 0 && (
        <p className="mt-6 text-sm text-neutral-400">No interactive elements were found.</p>
      )}

      {result && result.findings.length > 0 && (
        <div className="mt-8 overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
              <tr>
                <th className="px-4 py-2 font-medium">Element</th>
                <th className="px-4 py-2 font-medium">
                  <span className="flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5 text-red-500" aria-hidden /> Avoid
                  </span>
                </th>
                <th className="px-4 py-2 font-medium">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" aria-hidden /> Use instead
                  </span>
                </th>
                <th className="px-4 py-2 font-medium">Why</th>
              </tr>
            </thead>
            <tbody>
              {result.findings.map((f, i) => (
                <tr key={i} className="border-b border-neutral-100 dark:border-neutral-900 align-top last:border-0">
                  <td className="px-4 py-2">{f.element}</td>
                  <td className="px-4 py-2">
                    <code className="rounded bg-red-50 px-1.5 py-0.5 text-xs text-red-700 dark:bg-red-950/50 dark:text-red-300">
                      {f.badLocator}
                    </code>
                  </td>
                  <td className="px-4 py-2">
                    <code className="rounded bg-green-50 px-1.5 py-0.5 text-xs text-green-700 dark:bg-green-950/50 dark:text-green-300">
                      {f.goodLocator}
                    </code>
                  </td>
                  <td className="px-4 py-2 text-neutral-500">{f.reasoning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
