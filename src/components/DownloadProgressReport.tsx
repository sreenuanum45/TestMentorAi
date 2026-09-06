"use client";

import { FileDown } from "lucide-react";
import { downloadProgressReportPdf } from "@/lib/pdf";
import type { ExamRow } from "@/lib/repo";

export default function DownloadProgressReport({
  email,
  exams,
}: {
  email: string;
  exams: ExamRow[];
}) {
  return (
    <button
      type="button"
      onClick={() => downloadProgressReportPdf(email, exams)}
      className="flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
    >
      <FileDown className="h-4 w-4" aria-hidden />
      Download progress report
    </button>
  );
}
