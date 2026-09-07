import { CalendarCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getDailyChallengeActivity, hasCompletedDailyChallenge } from "@/lib/repo";
import { getTodaysChallenge, todayDateString } from "@/lib/dailyChallenge";
import { computeStreak } from "@/lib/streak";
import PageHero from "@/components/PageHero";
import DailyChallengeCard from "@/components/DailyChallengeCard";

export default async function DailyChallengePage() {
  const user = await getCurrentUser();
  if (!user) return null; // proxy guards this route

  const today = todayDateString();
  const [completedToday, activity] = await Promise.all([
    hasCompletedDailyChallenge(user.sub, today),
    getDailyChallengeActivity(user.sub, 60),
  ]);
  const streak = computeStreak(activity);
  const question = getTodaysChallenge();

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <PageHero
        icon={CalendarCheck}
        eyebrow="One a Day"
        title="Daily Challenge"
        description="A fresh QA interview question every day — a small, consistent habit beats cramming the night before."
        tagline="Show Up Daily. Stay Sharp."
        color="orange"
      />
      <div className="mt-6">
        <DailyChallengeCard question={question} completedToday={completedToday} streak={streak} />
      </div>
    </div>
  );
}
