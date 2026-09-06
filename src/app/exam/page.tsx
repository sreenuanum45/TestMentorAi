"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { McqQuestion, ShortAnswerQuestion } from "@/app/api/exam/generate/route";
import type { ExamFormat, ExamQuestionResult, ExamRow } from "@/lib/repo";
import { downloadExamPdf } from "@/lib/pdf";

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
      <div className="mx-auto max-w-lg p-6">
        <h1 className="mb-1 text-xl font-semibold">Timed Exam</h1>
        <p className="mb-6 text-sm text-neutral-500">
          A formal, timed QA exam — multiple-choice or short-answer, auto-graded at the end.
        </p>

        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Format</label>
            <div className="flex gap-1.5">
              {(["MCQ", "SHORT_ANSWER"] as ExamFormat[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  className={`rounded-full border px-3 py-1.5 text-xs ${
                    format === f
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}
                >
                  {f === "MCQ" ? "Multiple Choice" : "Short Answer"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Focus Area</label>
            <input
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            />
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {FOCUS_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFocus(p)}
                  className="rounded-full border border-neutral-300 dark:border-neutral-700 px-2.5 py-1 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Number of Questions</label>
            <div className="flex flex-wrap gap-1.5">
              {NUM_QUESTIONS_PRESETS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNumQuestions(n)}
                  className={`rounded-full border px-2.5 py-1 text-xs ${
                    numQuestions === n
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Time Limit</label>
            <div className="flex flex-wrap gap-1.5">
              {TIME_LIMIT_PRESETS.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => setTimeLimitSeconds(t.seconds)}
                  className={`rounded-full border px-2.5 py-1 text-xs ${
                    timeLimitSeconds === t.seconds
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleStart}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          >
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
              ⏱ {formatTime(remainingSeconds)}
            </div>
          )}
        </div>

        <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
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
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40"
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
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
            >
              Submit Exam
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
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
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium"
          >
            📄 Download PDF
          </button>
          <button
            type="button"
            onClick={resetExam}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          >
            New Exam
          </button>
          <Link
            href="/study"
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium"
          >
            Review weak spots in Study Companion
          </Link>
        </div>

        <div className="mt-6 space-y-3">
          {exam.breakdown.map((q, i) => (
            <div
              key={i}
              className={`rounded-xl border p-4 text-sm ${
                q.score >= q.maxScore * 0.6
                  ? "border-green-200 dark:border-green-900"
                  : "border-red-200 dark:border-red-900"
              }`}
            >
              <p className="font-medium">
                {i + 1}. {q.question}
              </p>
              {q.options ? (
                <div className="mt-2 space-y-1">
                  {q.options.map((opt, oi) => (
                    <p
                      key={oi}
                      className={
                        oi === q.correctIndex
                          ? "font-medium text-green-700 dark:text-green-400"
                          : oi === q.selectedIndex
                            ? "text-red-600 dark:text-red-400 line-through"
                            : "text-neutral-500"
                      }
                    >
                      {oi === q.correctIndex ? "✓ " : oi === q.selectedIndex ? "✗ " : "• "}
                      {opt}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="mt-2 space-y-1 text-neutral-600 dark:text-neutral-300">
                  <p>
                    <span className="font-medium">Your answer:</span>{" "}
                    {q.userAnswer?.trim() || "(blank)"}
                  </p>
                  <p>
                    <span className="font-medium">Model answer:</span> {q.modelAnswer}
                  </p>
                </div>
              )}
              <p className="mt-2 text-xs text-neutral-500">
                {q.explanation || q.feedback} · Score: {q.score}/{q.maxScore}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
