"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const RANGE_OPTIONS = [7, 14, 30, 90];
const MODULE_OPTIONS = [
  { value: "all", label: "All activity" },
  { value: "STUDY", label: "Study Companion only" },
  { value: "MOCK", label: "Mock Interviewer only" },
];

export default function DashboardFilters(props: { range: number; moduleFilter: string }) {
  return (
    <Suspense>
      <Filters {...props} />
    </Suspense>
  );
}

function Filters({ range, moduleFilter }: { range: number; moduleFilter: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <div className="relative">
        <select
          name="range"
          aria-label="Time range"
          value={range}
          onChange={(e) => updateParam("range", e.target.value)}
          className="appearance-none rounded-full border border-neutral-200 bg-white py-1.5 pl-8 pr-7 text-sm font-medium shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
        >
          {RANGE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              Last {r} days
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm">
          📅
        </span>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400">
          ▾
        </span>
      </div>
      <div className="relative">
        <select
          name="module"
          aria-label="Module filter"
          value={moduleFilter}
          onChange={(e) => updateParam("module", e.target.value)}
          className="appearance-none rounded-full border border-neutral-200 bg-white py-1.5 pl-8 pr-7 text-sm font-medium shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
        >
          {MODULE_OPTIONS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm">
          🔎
        </span>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400">
          ▾
        </span>
      </div>
    </div>
  );
}
