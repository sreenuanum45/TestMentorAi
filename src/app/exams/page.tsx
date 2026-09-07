import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { listExamsForUser } from "@/lib/repo";
import PageHeader from "@/components/PageHeader";

function pct(score: number, total: number): number {
  return total > 0 ? Math.round((score / total) * 100) : 0;
}

function scoreColor(p: number): string {
  if (p >= 80) return "text-green-600 dark:text-green-400";
  if (p >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-red-500";
}

export default async function ExamHistoryPage() {
  const user = await getCurrentUser();
  if (!user) return null; // proxy guards this route

  const exams = await listExamsForUser(user.sub, 100);
  const trend = [...exams].slice(0, 20).reverse();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <PageHeader
        icon={ClipboardList}
        title="Exam History"
        description="Every timed exam you've taken, with your score trend over time."
        color="orange"
      >
        <Link
          href="/exam"
          className="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm"
        >
          New Exam
        </Link>
      </PageHeader>

      {exams.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-400">
          No exam attempts yet — take a{" "}
          <Link href="/exam" className="text-primary hover:underline dark:text-indigo-400">
            Timed Exam
          </Link>{" "}
          to start building your history.
        </p>
      ) : (
        <>
          <div className="mt-6 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-400">
              Score trend (oldest → newest)
            </p>
            <div className="flex h-24 items-end gap-1.5">
              {trend.map((e) => {
                const p = pct(e.score, e.total);
                return (
                  <div key={e.id} className="group relative flex-1">
                    <div
                      className="mx-auto w-full rounded-t bg-orange-500/70 transition-colors group-hover:bg-orange-500 dark:bg-orange-500/60"
                      style={{ height: `${Math.max(4, (p / 100) * 96)}px` }}
                    />
                    <div className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-neutral-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-neutral-100 dark:text-neutral-900">
                      {p}% · {new Date(e.created_at).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 space-y-2">
            {exams.map((e) => {
              const p = pct(e.score, e.total);
              return (
                <Link
                  key={e.id}
                  href={`/exams/${e.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 p-4 text-sm transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                >
                  <div>
                    <p className="font-medium">
                      {e.format === "MCQ" ? "Multiple Choice" : "Short Answer"} — {e.focus}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {new Date(e.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className={`text-lg font-bold ${scoreColor(p)}`}>{p}%</div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
