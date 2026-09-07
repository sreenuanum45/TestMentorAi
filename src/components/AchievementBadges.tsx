import Link from "next/link";
import { Medal } from "lucide-react";
import type { Achievement } from "@/lib/achievements";

export default function AchievementBadges({ earned }: { earned: Achievement[] }) {
  return (
    <div className="mt-6 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-semibold">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
            <Medal className="h-4 w-4" aria-hidden />
          </span>
          Achievements ({earned.length})
        </h2>
        <Link href="/profile" className="text-sm text-primary hover:underline dark:text-indigo-400">
          View all
        </Link>
      </div>

      {earned.length === 0 ? (
        <p className="text-sm text-neutral-400">
          No badges yet — ask a question or take an exam to earn your first one.
        </p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {earned.map((a) => (
            <div
              key={a.id}
              title={a.description}
              className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 py-1.5 pl-1.5 pr-3 text-xs font-medium text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                <a.icon className="h-3.5 w-3.5" aria-hidden />
              </span>
              {a.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
