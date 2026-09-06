import jsPDF from "jspdf";
import type { ExamRow } from "@/lib/repo";

const MARGIN = 15;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

class PdfWriter {
  doc: jsPDF;
  y: number;

  constructor() {
    this.doc = new jsPDF({ unit: "mm", format: "a4" });
    this.y = MARGIN;
  }

  private ensureSpace(mm: number) {
    if (this.y + mm > PAGE_HEIGHT - MARGIN) {
      this.doc.addPage();
      this.y = MARGIN;
    }
  }

  title(text: string) {
    this.doc.setFontSize(16).setFont("helvetica", "bold");
    this.ensureSpace(8);
    this.doc.text(text, MARGIN, this.y);
    this.y += 8;
  }

  subtitle(text: string) {
    this.doc.setFontSize(10).setFont("helvetica", "normal");
    this.ensureSpace(6);
    this.doc.text(text, MARGIN, this.y);
    this.y += 8;
  }

  heading(text: string) {
    this.doc.setFontSize(11).setFont("helvetica", "bold");
    const wrapped = this.doc.splitTextToSize(text, CONTENT_WIDTH);
    this.ensureSpace(wrapped.length * 5 + 2);
    this.doc.text(wrapped, MARGIN, this.y);
    this.y += wrapped.length * 5 + 2;
  }

  body(text: string, options?: { color?: [number, number, number]; bold?: boolean }) {
    this.doc.setFontSize(9.5).setFont("helvetica", options?.bold ? "bold" : "normal");
    if (options?.color) this.doc.setTextColor(...options.color);
    else this.doc.setTextColor(40, 40, 40);
    const wrapped = this.doc.splitTextToSize(text, CONTENT_WIDTH - 4);
    this.ensureSpace(wrapped.length * 4.5 + 1);
    this.doc.text(wrapped, MARGIN + 2, this.y);
    this.y += wrapped.length * 4.5 + 1;
    this.doc.setTextColor(0, 0, 0);
  }

  rule() {
    this.ensureSpace(4);
    this.doc.setDrawColor(220, 220, 220);
    this.doc.line(MARGIN, this.y, PAGE_WIDTH - MARGIN, this.y);
    this.y += 4;
  }

  spacer(mm = 3) {
    this.y += mm;
  }

  save(filename: string) {
    this.doc.save(filename);
  }
}

export function downloadExamPdf(exam: ExamRow) {
  const w = new PdfWriter();
  const pct = exam.total > 0 ? Math.round((exam.score / exam.total) * 100) : 0;

  w.title(`QA Exam Result — ${exam.focus}`);
  w.subtitle(
    `${exam.format === "MCQ" ? "Multiple Choice" : "Short Answer"} · Score: ${exam.score}/${exam.total} (${pct}%) · ${new Date(exam.created_at).toLocaleString()}`
  );
  w.rule();

  exam.breakdown.forEach((q, i) => {
    w.heading(`${i + 1}. ${q.question}`);
    if (q.options) {
      q.options.forEach((opt, oi) => {
        const marker = oi === q.correctIndex ? "[correct] " : oi === q.selectedIndex ? "[your answer] " : "";
        w.body(`${marker}${opt}`, oi === q.correctIndex ? { color: [22, 101, 52], bold: true } : undefined);
      });
    } else {
      w.body(`Your answer: ${q.userAnswer?.trim() || "(blank)"}`);
      w.body(`Model answer: ${q.modelAnswer ?? ""}`);
    }
    if (q.explanation || q.feedback) w.body(`Note: ${q.explanation || q.feedback}`);
    w.body(`Score: ${q.score}/${q.maxScore}`, { bold: true });
    w.spacer(3);
    w.rule();
  });

  w.save(`qa-exam-${exam.focus.toLowerCase().replace(/\s+/g, "-")}.pdf`);
}

export function downloadProgressReportPdf(email: string, exams: ExamRow[]) {
  const w = new PdfWriter();
  w.title("QA Prep Progress Report");
  w.subtitle(`${email} · Generated ${new Date().toLocaleString()}`);
  w.rule();

  const totalExams = exams.length;
  const avgPct =
    totalExams > 0
      ? Math.round(
          (exams.reduce((acc, e) => acc + (e.total > 0 ? e.score / e.total : 0), 0) / totalExams) *
            100
        )
      : 0;

  w.heading("Summary");
  w.body(`Exams taken: ${totalExams}`);
  w.body(`Average score: ${avgPct}%`);
  w.spacer(3);
  w.rule();

  w.heading("Exam History");
  if (exams.length === 0) {
    w.body("No exams taken yet.");
  }
  exams.forEach((e) => {
    const pct = e.total > 0 ? Math.round((e.score / e.total) * 100) : 0;
    w.body(
      `${new Date(e.created_at).toLocaleDateString()} — ${e.focus} (${e.format === "MCQ" ? "Multiple Choice" : "Short Answer"}): ${e.score}/${e.total} (${pct}%)`,
      pct < 60 ? { color: [185, 28, 28] } : undefined
    );
  });

  w.save("qa-prep-progress-report.pdf");
}

export function downloadMockInterviewPdf(
  setup: { role: string; experience: string; focus: string; difficulty: string },
  messages: { role: "user" | "assistant"; content: string }[]
) {
  const w = new PdfWriter();
  w.title(`Mock Interview Transcript — ${setup.role}`);
  w.subtitle(
    `${setup.experience} · ${setup.focus} · ${setup.difficulty} · ${new Date().toLocaleString()}`
  );
  w.rule();

  messages.forEach((m) => {
    w.heading(m.role === "user" ? "Candidate" : "Interviewer");
    // Strip markdown emphasis/code fences for a cleaner plain-text PDF.
    const plain = m.content
      .replace(/```[\s\S]*?```/g, (block) => block.replace(/```/g, "").trim())
      .replace(/[*_#>`]/g, "");
    w.body(plain);
    w.spacer(2);
  });

  w.save(`mock-interview-${setup.role.toLowerCase().replace(/\s+/g, "-")}.pdf`);
}
