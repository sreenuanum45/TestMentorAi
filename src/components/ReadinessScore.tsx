import Link from "next/link";
import { ArrowRight, Gauge } from "lucide-react";
import type { ReadinessResult } from "@/lib/readiness";

function ringColor(score: number): string {
  if (score >= 80) return "text-emerald-500";
  if (score >= 50) return "text-amber-500";
  return "text-red-500";
}

function readinessLabel(score: number): string {
  if (score >= 80) return "Interview ready";
  if (score >= 50) return "Getting there";
  return "Needs work";
}

export default function ReadinessScore({ result }: { result: ReadinessResult }) {
  const { score, gaps } = result;
  const circumference = 2 * Math.PI * 26;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="mt-6 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800 sm:p-5">
      <h2 className="mb-4 flex items-center gap-2 font-semibold">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
          <Gauge className="h-4 w-4" aria-hidden />
        </span>
        Interview Readiness
      </h2>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
          <svg width="80" height="80" viewBox="0 0 64 64" className="-rotate-90">
            <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" strokeWidth="6" className="text-neutral-200 dark:text-neutral-800" />
            <circle
              cx="32"
              cy="32"
              r="26"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={`transition-all ${ringColor(score)}`}
            />
          </svg>
          <span className="absolute text-lg font-bold">{score}</span>
        </div>

        <div className="flex-1">
          <p className={`text-sm font-medium ${ringColor(score)}`}>{readinessLabel(score)}</p>
          {gaps.length > 0 ? (
            <ul className="mt-2 space-y-1.5">
              {gaps.map((g) => (
                <li key={g.label}>
                  <Link
                    href={g.href}
                    className="group flex items-center gap-1 text-sm text-neutral-500 hover:text-primary dark:hover:text-indigo-400"
                  >
                    {g.label}
                    <ArrowRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-neutral-500">
              You&apos;re covering every area well — keep the streak going!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
