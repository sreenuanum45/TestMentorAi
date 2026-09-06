import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

const FEATURES = [
  {
    href: "/study",
    title: "📚 Study Companion",
    description:
      "Ask any manual, automation, API, or non-functional testing question. Get a 5-part structured answer with mnemonics, level-by-level depth, and gotcha follow-ups. Attach screenshots for locator/defect analysis.",
  },
  {
    href: "/mock-interview",
    title: "🎤 Mock Interviewer",
    description:
      "A 5-question, one-at-a-time simulated interview with live micro-evaluations, optional voice mode, and a final Hire / No-Hire scorecard.",
  },
  {
    href: "/resume-questions",
    title: "📄 Resume-to-Question Generator",
    description:
      "Paste your resume and get a targeted question bank built from the exact tools you listed — click any question to drill it in the Study Companion.",
  },
  {
    href: "/locator-sandbox",
    title: "🔍 DOM / Locator Sandbox",
    description:
      "Paste raw HTML or a screenshot and get fragile selectors flagged with robust, self-healing replacements.",
  },
];

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-10 px-6 py-16 text-center">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">TestMentor AI</h1>
        <p className="mt-2 max-w-lg text-neutral-500">
          An elite QA engineering coach for interview prep — structured answers, not generic
          chatbot replies.
        </p>
        {!user && (
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/signup" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">
              Get started
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium"
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
            className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900"
          >
            <h2 className="text-lg font-medium">{f.title}</h2>
            <p className="mt-1 text-sm text-neutral-500">{f.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
