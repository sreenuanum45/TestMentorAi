"use client";

import { useRef, useState } from "react";
import { readImageFile, type ReadImageResult } from "@/lib/image";
import type { LocatorSandboxResult } from "@/app/api/locator-sandbox/route";

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
      <h1 className="text-xl font-semibold">DOM / Locator Sandbox</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Paste a raw HTML snippet, or attach a UI screenshot / DOM inspector screenshot. We&apos;ll
        flag fragile selectors and suggest self-healing replacements.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          rows={8}
          placeholder='e.g. <button class="btn primary-8f3a1">Submit</button>'
          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="cursor-pointer rounded-lg border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            📎 Attach screenshot
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
            className="ml-auto rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
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
                <th className="px-4 py-2 font-medium">❌ Avoid</th>
                <th className="px-4 py-2 font-medium">✅ Use instead</th>
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
