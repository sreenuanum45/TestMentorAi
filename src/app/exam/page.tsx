"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Clock,
  ClipboardList,
  FileDown,
  ListOrdered,
  PenLine,
  Play,
  RotateCcw,
  Timer,
} from "lucide-react";
import type { McqQuestion, ShortAnswerQuestion } from "@/app/api/exam/generate/route";
import type { ExamFormat, ExamQuestionResult, ExamRow } from "@/lib/repo";
import { downloadExamPdf } from "@/lib/pdf";
import PageHero from "@/components/PageHero";
import StepSection from "@/components/StepSection";
import OptionCard from "@/components/OptionCard";
import ExamBreakdownList from "@/components/ExamBreakdownList";

const FOCUS_PRESETS = [
  "Manual Testing",
  "Automation Frameworks",
  "API Testing",
  "Performance Testing",
  "Selenium/Playwright",
  "SQL & Test Data",
];
const NUM_QUESTIONS_PRESETS = [5, 10, 15, 20];
const TIME_LIMIT_PRESETS = [
  { label: "10 min", seconds: 10 * 60 },
  { label: "20 min", seconds: 20 * 60 },
  { label: "30 min", seconds: 30 * 60 },
  { label: "No limit", seconds: 0 },
];

type Stage = "setup" | "loading" | "taking" | "grading" | "results";

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ExamPage() {
  const [stage, setStage] = useState<Stage>("setup");
  const [format, setFormat] = useState<ExamFormat>("MCQ");
  const [focus, setFocus] = useState("Manual Testing");
  const [numQuestions, setNumQuestions] = useState(10);
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(20 * 60);
  const [error, setError] = useState<string | null>(null);

  const [mcqQuestions, setMcqQuestions] = useState<McqQuestion[]>([]);
  const [shortQuestions, setShortQuestions] = useState<ShortAnswerQuestion[]>([]);
  const [answers, setAnswers] = useState<(number | string | null)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [exam, setExam] = useState<ExamRow | null>(null);

  const submittingRef = useRef(false);

  const totalQuestions = format === "MCQ" ? mcqQuestions.length : shortQuestions.length;

  useEffect(() => {
    if (stage !== "taking" || timeLimitSeconds === 0) return;
    if (remainingSeconds <= 0) {
      handleSubmit();
      return;
    }
    const t = setTimeout(() => setRemainingSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, remainingSeconds]);

  async function handleStart() {
    setError(null);
    setStage("loading");
    try {
      const res = await fetch("/api/exam/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format, focus, numQuestions }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate exam");

      if (format === "MCQ") {
        setMcqQuestions(data.questions);
        setAnswers(new Array(data.questions.length).fill(null));
      } else {
        setShortQuestions(data.questions);
        setAnswers(new Array(data.questions.length).fill(""));
      }
      setCurrentIndex(0);
      setRemainingSeconds(timeLimitSeconds);
      setStage("taking");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStage("setup");
    }
  }

  async function handleSubmit() {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setError(null);
    setStage("grading");

    try {
      if (format === "MCQ") {
        const breakdown: ExamQuestionResult[] = mcqQuestions.map((q, i) => {
          const selectedIndex = answers[i] as number | null;
          return {
            question: q.question,
            options: q.options,
            correctIndex: q.correctIndex,
            selectedIndex: selectedIndex ?? -1,
            explanation: q.explanation,
            score: selectedIndex === q.correctIndex ? 1 : 0,
            maxScore: 1,
          };
        });
        const res = await fetch("/api/exam/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ format, focus, breakdown }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to submit exam");
        setExam(data.exam);
      } else {
        const res = await fetch("/api/exam/grade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            focus,
            questions: shortQuestions.map((q) => q.question),
            answers: answers.map((a) => (a as string) ?? ""),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to grade exam");
        setExam(data.exam);
      }
      setStage("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStage("taking");
    } finally {
      submittingRef.current = false;
    }
  }

  function setAnswer(value: number | string) {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = value;
      return next;
    });
  }

  function resetExam() {
    setStage("setup");
    setMcqQuestions([]);
    setShortQuestions([]);
    setAnswers([]);
    setExam(null);
    setError(null);
  }

  if (stage === "setup") {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <PageHero
          icon={ClipboardList}
          eyebrow="Assessment"
          title="Timed Exam"
          description="A formal, timed QA exam — multiple-choice or short-answer, auto-graded at the end."
          tagline="Challenge Your Skills. Track Your Growth."
          color="orange"
        />

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="mt-6 rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800 sm:p-6">
          <StepSection step={1} title="Format">
            <div className="flex flex-col gap-3 sm:flex-row">
              <OptionCard
                icon={CheckSquare}
                title="Multiple Choice"
                description="Pick the best answer from four options"
                selected={format === "MCQ"}
                onClick={() => setFormat("MCQ")}
              />
              <OptionCard
                icon={PenLine}
                title="Short Answer"
                description="Write free-form answers, graded by AI"
                selected={format === "SHORT_ANSWER"}
                onClick={() => setFormat("SHORT_ANSWER")}
              />
            </div>
          </StepSection>

          <StepSection step={2} title="Focus Area">
            <input
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {FOCUS_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFocus(p)}
                  className={`rounded-full border px-2.5 py-1 text-xs ${
                    focus === p
                      ? "border-primary bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                      : "border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </StepSection>

          <StepSection step={3} title="Number of Questions">
            <div className="flex flex-wrap gap-1.5">
              {NUM_QUESTIONS_PRESETS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNumQuestions(n)}
                  className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs ${
                    numQuestions === n
                      ? "border-primary bg-primary text-white"
                      : "border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                  }`}
                >
                  <ListOrdered className="h-3 w-3" aria-hidden />
                  {n}
                </button>
              ))}
            </div>
          </StepSection>

          <StepSection step={4} title="Time Limit">
            <div className="flex flex-wrap gap-1.5">
              {TIME_LIMIT_PRESETS.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => setTimeLimitSeconds(t.seconds)}
                  className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs ${
                    timeLimitSeconds === t.seconds
                      ? "border-primary bg-primary text-white"
                      : "border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                  }`}
                >
                  <Clock className="h-3 w-3" aria-hidden />
                  {t.label}
                </button>
              ))}
            </div>
          </StepSection>

          <button
            type="button"
            onClick={handleStart}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.01]"
          >
            <Play className="h-4 w-4" aria-hidden />
            Start Exam
          </button>
        </div>
      </div>
    );
  }

  if (stage === "loading") {
    return (
      <div className="mx-auto flex max-w-lg flex-1 items-center justify-center p-6">
        <p className="text-sm text-neutral-400">Generating your exam…</p>
      </div>
    );
  }

  if (stage === "taking") {
    const currentAnswer = answers[currentIndex];
    const isLast = currentIndex === totalQuestions - 1;

    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">
              {format === "MCQ" ? "Multiple Choice" : "Short Answer"} — {focus}
            </h1>
            <p className="text-sm text-neutral-500">
              Question {currentIndex + 1} of {totalQuestions}
            </p>
          </div>
          {timeLimitSeconds > 0 && (
            <div
              className={`rounded-lg border px-3 py-1.5 text-sm font-mono ${
                remainingSeconds <= 30
                  ? "border-red-400 bg-red-50 text-red-600 dark:bg-red-950/40"
                  : "border-neutral-300 dark:border-neutral-700"
              }`}
            >
              <Timer className="inline h-3.5 w-3.5 -translate-y-px" aria-hidden /> {formatTime(remainingSeconds)}
            </div>
          )}
        </div>

        <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>

        <div className="flex-1 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
          {format === "MCQ" ? (
            <>
              <p className="mb-4 font-medium">{mcqQuestions[currentIndex]?.question}</p>
              <div className="space-y-2">
                {mcqQuestions[currentIndex]?.options.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAnswer(i)}
                    className={`block w-full rounded-lg border px-3 py-2 text-left text-sm ${
                      currentAnswer === i
                        ? "border-primary bg-indigo-50 dark:bg-indigo-950/40"
                        : "border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="mb-4 font-medium">{shortQuestions[currentIndex]?.question}</p>
              <textarea
                value={(currentAnswer as string) ?? ""}
                onChange={(e) => setAnswer(e.target.value)}
                rows={8}
                placeholder="Type your answer…"
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </>
          )}
        </div>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        <div className="mt-4 flex justify-between">
          <button
            type="button"
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          {isLast ? (
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
            >
              Submit Exam
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
            >
              Next
            </button>
          )}
        </div>
      </div>
    );
  }

  if (stage === "grading") {
    return (
      <div className="mx-auto flex max-w-lg flex-1 items-center justify-center p-6">
        <p className="text-sm text-neutral-400">Grading your exam…</p>
      </div>
    );
  }

  if (stage === "results" && exam) {
    const pct = exam.total > 0 ? Math.round((exam.score / exam.total) * 100) : 0;
    return (
      <div className="mx-auto w-full max-w-2xl p-6">
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 text-center">
          <p className="text-sm text-neutral-500">
            {format === "MCQ" ? "Multiple Choice" : "Short Answer"} — {focus}
          </p>
          <p className="mt-2 text-4xl font-bold">{pct}%</p>
          <p className="text-sm text-neutral-500">
            {exam.score} / {exam.total} points
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => downloadExamPdf(exam)}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium"
          >
            <FileDown className="h-4 w-4" aria-hidden />
            Download PDF
          </button>
          <button
            type="button"
            onClick={resetExam}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            New Exam
          </button>
          <Link
            href="/study"
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium"
          >
            Review weak spots in Study Companion
          </Link>
          <Link
            href="/exams"
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium"
          >
            View exam history
          </Link>
        </div>

        <div className="mt-6">
          <ExamBreakdownList breakdown={exam.breakdown} />
        </div>
      </div>
    );
  }

  return null;
}
