import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { listExamsForUser } from "@/lib/repo";

export default async function ReviewPage() {
  const user = await getCurrentUser();
  if (!user) return null; // proxy guards this route

  const exams = await listExamsForUser(user.sub, 50);

  const weakItems = exams
    .flatMap((exam) =>
      exam.breakdown
        .filter((q) => q.maxScore > 0 && q.score / q.maxScore < 0.6)
        .map((q) => ({ ...q, examFocus: exam.focus, examDate: exam.created_at }))
    )
    .sort((a, b) => a.score / a.maxScore - b.score / b.maxScore)
    .slice(0, 30);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <h1 className="text-xl font-semibold">Review — Weak Spots</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Questions you scored lowest on across past timed exams — worth revisiting before your
        next interview.
      </p>

      {exams.length === 0 && (
        <p className="mt-6 text-sm text-neutral-400">
          No exam attempts yet — take a{" "}
          <Link href="/exam" className="text-blue-600 hover:underline dark:text-blue-400">
            Timed Exam
          </Link>{" "}
          to start building your review list.
        </p>
      )}

      {exams.length > 0 && weakItems.length === 0 && (
        <p className="mt-6 text-sm text-neutral-400">
          No weak spots found in your recent exams — nice work. Keep it up!
        </p>
      )}

      <div className="mt-6 space-y-3">
        {weakItems.map((q, i) => (
          <div
            key={i}
            className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 text-sm"
          >
            <div className="mb-1 flex items-center justify-between text-xs text-neutral-400">
              <span>
                {q.examFocus} · {new Date(q.examDate).toLocaleDateString()}
              </span>
              <span className="font-medium text-red-500">
                {q.score}/{q.maxScore}
              </span>
            </div>
            <p className="font-medium">{q.question}</p>
            {q.modelAnswer && (
              <p className="mt-1 text-neutral-500">Model answer: {q.modelAnswer}</p>
            )}
            {(q.explanation || q.feedback) && (
              <p className="mt-1 text-neutral-500">{q.explanation || q.feedback}</p>
            )}
            <Link
              href={`/study?q=${encodeURIComponent(q.question)}`}
              className="mt-2 inline-block text-blue-600 hover:underline dark:text-blue-400"
            >
              Practice in Study Companion →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
