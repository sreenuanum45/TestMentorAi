import { Lock, User } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { countBookmarks, countMessagesByModule, getActivityByDay, listExamsForUser } from "@/lib/repo";
import { ACHIEVEMENTS, computeEarnedAchievements } from "@/lib/achievements";
import { computeStreak } from "@/lib/streak";
import PageHeader from "@/components/PageHeader";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null; // proxy guards this route

  const [studyCount, mockCount, exams, bookmarkCount, activity] = await Promise.all([
    countMessagesByModule(user.sub, "STUDY"),
    countMessagesByModule(user.sub, "MOCK"),
    listExamsForUser(user.sub, 100),
    countBookmarks(user.sub),
    getActivityByDay(user.sub, undefined, 30),
  ]);

  const examPcts = exams.filter((e) => e.total > 0).map((e) => (e.score / e.total) * 100);
  const stats = {
    studyCount,
    mockCount,
    examCount: exams.length,
    bestExamPct: examPcts.length > 0 ? Math.max(...examPcts) : 0,
    perfectExamCount: exams.filter((e) => e.total > 0 && e.score === e.total).length,
    streak: computeStreak(activity),
    bookmarkCount,
  };
  const earnedIds = new Set(computeEarnedAchievements(stats).map((a) => a.id));

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <PageHeader icon={User} title="Profile" color="blue" />

      <div className="flex items-center gap-4 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-xl font-semibold text-white">
          {user.email[0]?.toUpperCase()}
        </span>
        <div>
          <p className="font-medium">{user.email}</p>
          <span
            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs ${
              user.role === "ADMIN"
                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
                : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
            }`}
          >
            {user.role === "ADMIN" ? "Admin" : "Student"}
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 text-center">
          <div className="text-2xl font-bold">{studyCount}</div>
          <div className="text-xs text-neutral-500">Study questions</div>
        </div>
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 text-center">
          <div className="text-2xl font-bold">{mockCount}</div>
          <div className="text-xs text-neutral-500">Mock interview turns</div>
        </div>
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 text-center">
          <div className="text-2xl font-bold">{exams.length}</div>
          <div className="text-xs text-neutral-500">Exams taken</div>
        </div>
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 text-center">
          <div className="text-2xl font-bold">{bookmarkCount}</div>
          <div className="text-xs text-neutral-500">Saved items</div>
        </div>
      </div>

      <h2 className="mb-3 mt-8 text-sm font-medium">
        Achievements ({earnedIds.size}/{ACHIEVEMENTS.length})
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ACHIEVEMENTS.map((a) => {
          const earned = earnedIds.has(a.id);
          return (
            <div
              key={a.id}
              className={`flex items-center gap-3 rounded-xl border p-3 ${
                earned
                  ? "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30"
                  : "border-neutral-200 opacity-60 dark:border-neutral-800"
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  earned
                    ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white"
                    : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800"
                }`}
              >
                {earned ? <a.icon className="h-4 w-4" aria-hidden /> : <Lock className="h-4 w-4" aria-hidden />}
              </span>
              <div>
                <p className="text-sm font-medium">{a.title}</p>
                <p className="text-xs text-neutral-500">{a.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
