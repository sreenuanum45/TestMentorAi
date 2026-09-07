import {
  Award,
  BookOpen,
  Bookmark,
  Compass,
  Crosshair,
  Flame,
  Mic,
  Rocket,
  Sparkles,
  Trophy,
  type LucideIcon,
} from "lucide-react";

export interface AchievementStats {
  studyCount: number;
  mockCount: number;
  examCount: number;
  bestExamPct: number;
  perfectExamCount: number;
  streak: number;
  bookmarkCount: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  check: (s: AchievementStats) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-study",
    title: "First Steps",
    description: "Ask your first Study Companion question",
    icon: BookOpen,
    check: (s) => s.studyCount >= 1,
  },
  {
    id: "curious-mind",
    title: "Curious Mind",
    description: "Ask 25 Study Companion questions",
    icon: Compass,
    check: (s) => s.studyCount >= 25,
  },
  {
    id: "first-mock",
    title: "Interview Ready",
    description: "Complete a turn in the Mock Interviewer",
    icon: Mic,
    check: (s) => s.mockCount >= 1,
  },
  {
    id: "mock-marathon",
    title: "Mock Marathoner",
    description: "Rack up 50 mock interview turns",
    icon: Rocket,
    check: (s) => s.mockCount >= 50,
  },
  {
    id: "first-exam",
    title: "Exam Taker",
    description: "Complete your first Timed Exam",
    icon: Crosshair,
    check: (s) => s.examCount >= 1,
  },
  {
    id: "sharp-shooter",
    title: "Sharp Shooter",
    description: "Score 90% or higher on an exam",
    icon: Award,
    check: (s) => s.bestExamPct >= 90,
  },
  {
    id: "perfectionist",
    title: "Perfectionist",
    description: "Score a perfect 100% on an exam",
    icon: Trophy,
    check: (s) => s.perfectExamCount >= 1,
  },
  {
    id: "on-fire",
    title: "On Fire",
    description: "Reach a 3-day study streak",
    icon: Flame,
    check: (s) => s.streak >= 3,
  },
  {
    id: "unstoppable",
    title: "Unstoppable",
    description: "Reach a 7-day study streak",
    icon: Flame,
    check: (s) => s.streak >= 7,
  },
  {
    id: "dedicated",
    title: "Dedicated",
    description: "Reach a 30-day study streak",
    icon: Flame,
    check: (s) => s.streak >= 30,
  },
  {
    id: "collector",
    title: "Collector",
    description: "Save 5 items to your bookmarks",
    icon: Bookmark,
    check: (s) => s.bookmarkCount >= 5,
  },
  {
    id: "well-rounded",
    title: "Well-Rounded",
    description: "Try Study, Mock Interview, and Timed Exam",
    icon: Sparkles,
    check: (s) => s.studyCount >= 1 && s.mockCount >= 1 && s.examCount >= 1,
  },
];

export function computeEarnedAchievements(stats: AchievementStats): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.check(stats));
}
