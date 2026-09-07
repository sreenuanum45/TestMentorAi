"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { AlertTriangle, Code2, Play, RotateCcw, Terminal } from "lucide-react";
import { CODE_LANGUAGES, getCodeLanguage } from "@/lib/codeLanguages";
import { CODING_PROBLEMS, type CodingProblem } from "@/lib/codingProblems";
import PageHero from "@/components/PageHero";

interface RunResponse {
  stdout: string;
  stderr: string;
  compileOutput: string;
  message: string;
  time: string | null;
  memory: number | null;
  status: { id: number; description: string };
}

const ACCEPTED_STATUS_ID = 3;
const COMPILE_ERROR_STATUS_ID = 6;

export default function CodingPracticePage() {
  const [languageId, setLanguageId] = useState(CODE_LANGUAGES[0].id);
  const [code, setCode] = useState(CODE_LANGUAGES[0].template);
  const [stdin, setStdin] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const language = getCodeLanguage(languageId) ?? CODE_LANGUAGES[0];

  function selectLanguage(id: string) {
    const lang = getCodeLanguage(id);
    if (!lang) return;
    setLanguageId(id);
    setCode(lang.template);
    setResult(null);
    setError(null);
  }

  function loadProblem(problem: CodingProblem) {
    const lines = problem.prompt.match(/.{1,90}(\s|$)/g) ?? [problem.prompt];
    const header = [
      `${language.commentPrefix} ${problem.title} (${problem.difficulty})`,
      ...lines.map((l) => `${language.commentPrefix} ${l.trim()}`),
      "",
    ].join("\n");
    setCode(`${header}\n${language.template}`);
    setResult(null);
    setError(null);
  }

  async function handleRun() {
    if (!code.trim()) return;
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/code/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ languageId, code, stdin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to run code");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setRunning(false);
    }
  }

  function handleReset() {
    setCode(language.template);
    setStdin("");
    setResult(null);
    setError(null);
  }

  const isCompileError = result?.status.id === COMPILE_ERROR_STATUS_ID;
  const isAccepted = result?.status.id === ACCEPTED_STATUS_ID;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <PageHero
        icon={Code2}
        eyebrow="Practice"
        title="Coding Practice"
        description="Write, run, and debug real code in a full online IDE — Java, Python, JavaScript, TypeScript, C++, and C."
        tagline="Code It. Run It. Nail It."
        color="cyan"
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[16rem_1fr]">
        <div className="space-y-6">
          <div>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Language
            </h2>
            <div className="flex flex-wrap gap-1.5 lg:flex-col">
              {CODE_LANGUAGES.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => selectLanguage(l.id)}
                  className={`rounded-lg px-3 py-1.5 text-left text-sm font-medium transition-colors ${
                    languageId === l.id
                      ? "bg-primary text-white"
                      : "border border-neutral-200 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Practice Problems
            </h2>
            <div className="space-y-1.5">
              {CODING_PROBLEMS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => loadProblem(p)}
                  className="block w-full rounded-lg border border-neutral-200 px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-800"
                >
                  <span className="font-medium">{p.title}</span>
                  <span
                    className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                      p.difficulty === "Easy"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                        : p.difficulty === "Medium"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                          : "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300"
                    }`}
                  >
                    {p.difficulty}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="overflow-hidden rounded-xl border border-neutral-800">
            <div className="flex items-center justify-between bg-neutral-900 px-4 py-2">
              <span className="text-xs font-medium text-neutral-400">
                {language.label} · main
              </span>
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" aria-hidden />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" aria-hidden />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" aria-hidden />
              </div>
            </div>
            <Editor
              height="420px"
              language={language.monacoId}
              value={code}
              onChange={(value) => setCode(value ?? "")}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                padding: { top: 12 },
              }}
              loading={
                <div className="flex h-full w-full items-center justify-center bg-neutral-950 text-sm text-neutral-500">
                  Loading editor…
                </div>
              }
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleRun}
              disabled={running}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
            >
              <Play className="h-4 w-4" aria-hidden />
              {running ? "Running…" : "Run"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium dark:border-neutral-700"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Reset
            </button>
          </div>

          <details className="mt-4 rounded-lg border border-neutral-200 dark:border-neutral-800">
            <summary className="cursor-pointer select-none px-3 py-2 text-sm font-medium">
              Custom input (stdin)
            </summary>
            <textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="Anything your program reads from standard input…"
              rows={3}
              className="w-full resize-y border-t border-neutral-200 bg-transparent p-3 font-mono text-xs focus:outline-none dark:border-neutral-800"
            />
          </details>

          {error && (
            <p className="mt-4 flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
              <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
              {error}
            </p>
          )}

          {result && (
            <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  <Terminal className="h-3.5 w-3.5" aria-hidden />
                  Output
                </h3>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    isAccepted ? "bg-emerald-950/50 text-emerald-400" : "bg-red-950/50 text-red-400"
                  }`}
                >
                  {result.status.description}
                  {result.time ? ` · ${result.time}s` : ""}
                </span>
              </div>

              {isCompileError && (
                <pre className="mb-2 whitespace-pre-wrap break-words rounded-lg bg-red-950/30 p-3 font-mono text-xs text-red-300">
                  {result.compileOutput || "Compilation failed."}
                </pre>
              )}

              {result.stdout && (
                <pre className="whitespace-pre-wrap break-words font-mono text-sm text-neutral-100">
                  {result.stdout}
                </pre>
              )}
              {result.stderr && (
                <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-sm text-red-400">
                  {result.stderr}
                </pre>
              )}
              {!isCompileError && result.message && !result.stdout && !result.stderr && (
                <p className="text-sm text-neutral-400">{result.message}</p>
              )}
              {!isCompileError && !result.stdout && !result.stderr && !result.message && (
                <p className="text-sm text-neutral-500">No output.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
