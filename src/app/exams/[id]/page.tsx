import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getExamById } from "@/lib/repo";
import PageHeader from "@/components/PageHeader";
import ExamBreakdownList from "@/components/ExamBreakdownList";
import DownloadExamButton from "@/components/DownloadExamButton";

export default async function ExamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return null; // proxy guards this route

  const { id } = await params;
  const exam = await getExamById(id, user.sub);
  if (!exam) notFound();

  const pct = exam.total > 0 ? Math.round((exam.score / exam.total) * 100) : 0;

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <Link
        href="/exams"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Back to Exam History
      </Link>

      <PageHeader
        icon={ClipboardList}
        title={`${exam.format === "MCQ" ? "Multiple Choice" : "Short Answer"} — ${exam.focus}`}
        description={new Date(exam.created_at).toLocaleString()}
        color="orange"
      />

      <div className="rounded-2xl border border-neutral-200 p-6 text-center dark:border-neutral-800">
        <p className="text-4xl font-bold">{pct}%</p>
        <p className="text-sm text-neutral-500">
          {exam.score} / {exam.total} points
        </p>
      </div>

      <div className="mt-4">
        <DownloadExamButton exam={exam} />
      </div>

      <div className="mt-6">
        <ExamBreakdownList breakdown={exam.breakdown} />
      </div>
    </div>
  );
}
