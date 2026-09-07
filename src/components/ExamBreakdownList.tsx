import type { ExamQuestionResult } from "@/lib/repo";
import BookmarkButton from "@/components/BookmarkButton";

export default function ExamBreakdownList({ breakdown }: { breakdown: ExamQuestionResult[] }) {
  return (
    <div className="space-y-3">
      {breakdown.map((q, i) => (
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
                <span className="font-medium">Your answer:</span> {q.userAnswer?.trim() || "(blank)"}
              </p>
              <p>
                <span className="font-medium">Model answer:</span> {q.modelAnswer}
              </p>
            </div>
          )}
          <p className="mt-2 text-xs text-neutral-500">
            {q.explanation || q.feedback} · Score: {q.score}/{q.maxScore}
          </p>
          <BookmarkButton
            module="EXAM"
            question={q.question}
            answer={q.modelAnswer || q.explanation || q.feedback}
            className="mt-2"
          />
        </div>
      ))}
    </div>
  );
}
