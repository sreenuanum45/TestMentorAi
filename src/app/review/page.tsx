import Link from "next/link";
import { Repeat } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { listExamsForUser } from "@/lib/repo";
import DownloadProgressReport from "@/components/DownloadProgressReport";
import PageHeader from "@/components/PageHeader";
import BookmarkButton from "@/components/BookmarkButton";

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
      <PageHeader
        icon={Repeat}
        title="Review — Weak Spots"
        description="Questions you scored lowest on across past timed exams — worth revisiting before your next interview."
        color="violet"
      >
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/exams"
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium dark:border-neutral-700"
          >
            Exam History
          </Link>
          {exams.length > 0 && <DownloadProgressReport email={user.email} exams={exams} />}
        </div>
      </PageHeader>

      {exams.length === 0 && (
        <p className="mt-6 text-sm text-neutral-400">
          No exam attempts yet — take a{" "}
          <Link href="/exam" className="text-primary hover:underline dark:text-indigo-400">
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
            <div className="mt-2 flex items-center gap-4">
              <Link
                href={`/study?q=${encodeURIComponent(q.question)}`}
                className="text-primary hover:underline dark:text-indigo-400"
              >
                Practice in Study Companion →
              </Link>
              <BookmarkButton
                module="EXAM"
                question={q.question}
                answer={q.modelAnswer || q.explanation || q.feedback}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
