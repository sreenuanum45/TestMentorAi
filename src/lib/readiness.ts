export interface ReadinessInputs {
  studyCount: number;
  mockCount: number;
  examCount: number;
  avgExamPct: number;
  streak: number;
}

export interface ReadinessGap {
  label: string;
  href: string;
}

export interface ReadinessResult {
  score: number;
  gaps: ReadinessGap[];
}

const STUDY_TARGET = 30;
const MOCK_TARGET = 20;
const STREAK_TARGET = 14;

export function computeReadiness(inputs: ReadinessInputs): ReadinessResult {
  const examScore = inputs.examCount > 0 ? inputs.avgExamPct : 0;
  const mockScore = Math.min(inputs.mockCount / MOCK_TARGET, 1) * 100;
  const studyScore = Math.min(inputs.studyCount / STUDY_TARGET, 1) * 100;
  const streakScore = Math.min(inputs.streak / STREAK_TARGET, 1) * 100;

  const score = Math.round(examScore * 0.35 + mockScore * 0.25 + studyScore * 0.2 + streakScore * 0.2);

  const gaps: ReadinessGap[] = [];
  if (inputs.examCount === 0) {
    gaps.push({ label: "Take your first Timed Exam", href: "/exam" });
  } else if (inputs.avgExamPct < 70) {
    gaps.push({ label: "Review weak spots from past exams", href: "/review" });
  }
  if (inputs.mockCount < 5) {
    gaps.push({ label: "Practice more Mock Interview turns", href: "/mock-interview" });
  }
  if (inputs.studyCount < 10) {
    gaps.push({ label: "Ask more Study Companion questions", href: "/study" });
  }
  if (inputs.streak < 3) {
    gaps.push({ label: "Build a daily practice streak", href: "/dashboard" });
  }

  return { score: Math.max(0, Math.min(100, score)), gaps };
}
