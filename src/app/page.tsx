import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  FileText,
  GraduationCap,
  Mic,
  Search,
  type LucideIcon,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

const FEATURES: {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
}[] = [
  {
    href: "/study",
    title: "Study Companion",
    description:
      "Ask any manual, automation, API, or non-functional testing question. Get a 5-part structured answer with mnemonics, level-by-level depth, and gotcha follow-ups. Attach screenshots for locator/defect analysis.",
    icon: BookOpen,
    gradient: "from-blue-600 to-indigo-600",
  },
  {
    href: "/mock-interview",
    title: "Mock Interviewer",
    description:
      "A one-at-a-time simulated interview with live micro-evaluations, optional voice mode, and a final Hire / No-Hire scorecard.",
    icon: Mic,
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    href: "/exam",
    title: "Timed Exam",
    description:
      "A formal, timed QA exam — multiple-choice or short-answer, auto-graded instantly with a per-question breakdown and a downloadable PDF report.",
    icon: ClipboardList,
    gradient: "from-orange-500 to-amber-500",
  },
  {
    href: "/resume-questions",
    title: "Resume-to-Question Generator",
    description:
      "Paste your resume and get a targeted question bank built from the exact tools you listed — click any question to drill it in the Study Companion.",
    icon: FileText,
    gradient: "from-violet-600 to-fuchsia-600",
  },
  {
    href: "/locator-sandbox",
    title: "DOM / Locator Sandbox",
    description:
      "Paste raw HTML or a screenshot and get fragile selectors flagged with robust, self-healing replacements.",
    icon: Search,
    gradient: "from-rose-500 to-pink-600",
  },
];

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center gap-12 px-6 py-16 text-center">
      <div>
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm">
          <GraduationCap className="h-7 w-7" aria-hidden />
        </span>
        <h1 className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-4xl font-extrabold text-transparent drop-shadow-sm">
          TestMentor AI
        </h1>
        <p className="mt-3 max-w-lg text-neutral-500">
          An elite QA engineering coach for interview prep — structured answers, not generic
          chatbot replies.
        </p>
        {!user && (
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/signup"
              className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02]"
            >
              Get started
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-900"
            >
              Log in
            </Link>
          </div>
        )}
      </div>

      <div className="grid w-full gap-4 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <Link
            key={f.href}
            href={user ? f.href : "/signup"}
            className="group flex items-start gap-4 rounded-xl border border-neutral-200 p-6 text-left transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-800"
          >
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} text-white shadow-sm`}
            >
              <f.icon className="h-5 w-5" aria-hidden />
            </span>
            <div className="flex-1">
              <h2 className="flex items-center gap-1.5 text-lg font-medium">
                {f.title}
                <ArrowRight
                  className="h-4 w-4 text-neutral-400 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100"
                  aria-hidden
                />
              </h2>
              <p className="mt-1 text-sm text-neutral-500">{f.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
