import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { countMessagesByModule, getActivityByDay, type ChatModule } from "@/lib/repo";
import ActivityChart from "@/components/ActivityChart";
import DashboardFilters from "@/components/DashboardFilters";
import DashboardIllustration from "@/components/DashboardIllustration";
import MiniBars from "@/components/MiniBars";

const RANGE_OPTIONS = [7, 14, 30, 90];

function fmt(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function computeStreak(countsByDay: Map<string, number>): number {
  const cursor = new Date();
  if ((countsByDay.get(fmt(cursor)) ?? 0) === 0) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  let streak = 0;
  while ((countsByDay.get(fmt(cursor)) ?? 0) > 0) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

/** Sum of counts for the `days` calendar days ending `offset` days ago. */
function sumWindow(countsByDay: Map<string, number>, days: number, offset: number): number {
  let sum = 0;
  const cursor = new Date();
  cursor.setUTCDate(cursor.getUTCDate() - offset);
  for (let i = 0; i < days; i++) {
    sum += countsByDay.get(fmt(cursor)) ?? 0;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return sum;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; module?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null; // middleware guards this route

  const params = await searchParams;
  const range = RANGE_OPTIONS.includes(Number(params.range)) ? Number(params.range) : 14;
  const moduleFilter: "all" | ChatModule =
    params.module === "STUDY" || params.module === "MOCK" ? params.module : "all";

  const [studyCount, mockCount, allActivity, studyActivity, mockActivity, chartActivity] =
    await Promise.all([
      countMessagesByModule(user.sub, "STUDY"),
      countMessagesByModule(user.sub, "MOCK"),
      getActivityByDay(user.sub, undefined, 30), // streak always reflects all activity
      getActivityByDay(user.sub, "STUDY", 14),
      getActivityByDay(user.sub, "MOCK", 14),
      getActivityByDay(user.sub, moduleFilter === "all" ? undefined : moduleFilter, range),
    ]);

  const chartCountsByDay = new Map(chartActivity.map((a) => [a.day, a.count]));
  const chartDays: { day: string; count: number }[] = [];
  const cursor = new Date();
  cursor.setUTCDate(cursor.getUTCDate() - (range - 1));
  for (let i = 0; i < range; i++) {
    const day = fmt(cursor);
    chartDays.push({ day, count: chartCountsByDay.get(day) ?? 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  const streak = computeStreak(new Map(allActivity.map((a) => [a.day, a.count])));

  const studyByDay = new Map(studyActivity.map((a) => [a.day, a.count]));
  const mockByDay = new Map(mockActivity.map((a) => [a.day, a.count]));
  const studyThisWeek = sumWindow(studyByDay, 7, 0);
  const mockThisWeek = sumWindow(mockByDay, 7, 0);

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-purple-950/40 sm:p-8">
        <div className="relative z-10 max-w-md">
          <p className="text-sm text-neutral-500">Welcome back,</p>
          <h1 className="break-all bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-3xl font-extrabold text-transparent drop-shadow-sm sm:text-4xl">
            {user.email}
          </h1>
          <p className="mt-2 text-sm text-neutral-500">Here&apos;s your prep activity.</p>
        </div>
        <DashboardIllustration className="pointer-events-none absolute -right-4 top-1/2 hidden h-40 w-64 -translate-y-1/2 sm:block" />
        <p className="pointer-events-none absolute right-6 top-4 hidden max-w-[9rem] text-right text-xs font-medium text-indigo-400 sm:block dark:text-indigo-300">
          Your career journey starts here
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-950/30">
          <div className="flex items-start justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg text-white">
              💬
            </span>
            <MiniBars className="text-blue-500" />
          </div>
          <div className="mt-3 text-2xl font-bold">{studyCount}</div>
          <div className="text-xs text-neutral-500">Study questions asked</div>
          {studyThisWeek > 0 && (
            <div className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              ↗ +{studyThisWeek} this week
            </div>
          )}
        </div>
        <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
          <div className="flex items-start justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-lg text-white">
              🎯
            </span>
            <MiniBars className="text-emerald-500" />
          </div>
          <div className="mt-3 text-2xl font-bold">{mockCount}</div>
          <div className="text-xs text-neutral-500">Mock interview turns</div>
          {mockThisWeek > 0 && (
            <div className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              ↗ +{mockThisWeek} this week
            </div>
          )}
        </div>
        <div className="rounded-xl bg-orange-50 p-4 dark:bg-orange-950/30">
          <div className="flex items-start justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-lg text-white">
              🔥
            </span>
            <MiniBars className="text-orange-500" />
          </div>
          <div className="mt-3 text-2xl font-bold">{streak}</div>
          <div className="text-xs text-neutral-500">Day streak</div>
          <div className="mt-1 text-xs font-medium text-orange-500">
            {streak > 0 ? "Keep it going!" : "Start today!"}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">
            Activity (Last {range} days
            {moduleFilter !== "all" ? ` — ${moduleFilter === "STUDY" ? "Study Companion" : "Mock Interviewer"}` : ""})
          </h2>
          <DashboardFilters range={range} moduleFilter={moduleFilter} />
        </div>
        <ActivityChart data={chartDays} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/study"
          className="group flex items-center gap-4 rounded-xl border border-neutral-200 bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white transition-transform hover:scale-[1.01] dark:border-neutral-800"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 text-xl">
            📚
          </span>
          <div className="flex-1">
            <p className="font-semibold">Continue studying</p>
            <p className="text-sm text-white/80">Pick up where you left off</p>
          </div>
          <span aria-hidden className="text-xl transition-transform group-hover:translate-x-1">
            →
          </span>
        </Link>
        <Link
          href="/mock-interview"
          className="group flex items-center gap-4 rounded-xl border border-neutral-200 bg-gradient-to-r from-emerald-500 to-teal-600 p-5 text-white transition-transform hover:scale-[1.01] dark:border-neutral-800"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 text-xl">
            🎤
          </span>
          <div className="flex-1">
            <p className="font-semibold">Start a mock interview</p>
            <p className="text-sm text-white/80">Practice with AI and improve</p>
          </div>
          <span aria-hidden className="text-xl transition-transform group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>
    </div>
  );
}
