import Link from "next/link";
import { Sparkles, Zap, BarChart3, Infinity as InfinityIcon } from "lucide-react";

const PLANNED_FEATURES = [
  {
    icon: InfinityIcon,
    title: "Unlimited practice questions",
    description: "No daily caps on Study Companion, Mock Interviewer, or Timed Exam usage.",
  },
  {
    icon: BarChart3,
    title: "Advanced analytics",
    description: "Deeper breakdowns of your weak topics, score trends over time, and readiness estimates.",
  },
  {
    icon: Zap,
    title: "Priority AI responses",
    description: "Faster generation and access to higher-quality models for exams and interviews.",
  },
];

export default function ProPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white">
        <Sparkles className="h-7 w-7" aria-hidden />
      </span>
      <h1 className="mt-4 text-2xl font-bold">TestMentor AI Pro</h1>
      <p className="mt-2 text-neutral-500">
        There&apos;s no paid plan yet — this is a preview of what a Pro tier could include. Nothing
        here is active or billed.
      </p>

      <div className="mt-8 space-y-3 text-left">
        {PLANNED_FEATURES.map((f) => (
          <div
            key={f.title}
            className="flex items-start gap-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
              <f.icon className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <p className="font-medium">{f.title}</p>
              <p className="text-sm text-neutral-500">{f.description}</p>
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/dashboard"
        className="mt-8 inline-block rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium dark:border-neutral-700"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
