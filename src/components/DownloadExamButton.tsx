"use client";

import { FileDown } from "lucide-react";
import { downloadExamPdf } from "@/lib/pdf";
import type { ExamRow } from "@/lib/repo";

export default function DownloadExamButton({ exam }: { exam: ExamRow }) {
  return (
    <button
      type="button"
      onClick={() => downloadExamPdf(exam)}
      className="flex items-center gap-1.5 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium dark:border-neutral-700"
    >
      <FileDown className="h-4 w-4" aria-hidden />
      Download PDF
    </button>
  );
}
