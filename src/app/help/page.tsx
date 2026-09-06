const FAQS = [
  {
    q: "How does the Mock Interviewer decide when to advance to the next question?",
    a: "It reads the whole conversation so far. If your answer genuinely addresses the question, it evaluates it and moves on; if the answer is off-topic, blank, or looks like a garbled voice transcript, it will say so and ask you to try again instead of silently repeating itself.",
  },
  {
    q: "Why did my Timed Exam score come back lower than expected?",
    a: "Short-answer exams are graded by the AI against a rubric of technical precision, not keyword matching — a vague or generic answer scores low even if it's not technically wrong. Check the model answer shown next to each question for what a strong answer looks like.",
  },
  {
    q: "Can I use voice input in the Mock Interviewer?",
    a: "Yes, in browsers that support the Web Speech API (Chrome and Edge). Turn on \"Voice\" in the interview header, then use the microphone button next to the answer box. Voice accuracy depends on your browser/OS, not on TestMentor AI — you can always edit the transcribed text before sending.",
  },
  {
    q: "Where do my Study Companion diagrams come from?",
    a: "For structural or flow-based questions (architecture, CI/CD, Page Object Model, etc.), the AI can generate an actual Mermaid diagram alongside its answer, rendered inline — not just a text description.",
  },
  {
    q: "Is image generation available in Study Companion?",
    a: "There's a \"Generate image\" button on any answer, but it calls a paid Gemini model — it only works once billing is enabled on the underlying Google AI Studio project.",
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <h1 className="text-xl font-semibold">Help & Support</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Common questions about how TestMentor AI works.
      </p>

      <div className="mt-6 space-y-3">
        {FAQS.map((item) => (
          <details
            key={item.q}
            className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4"
          >
            <summary className="cursor-pointer select-none font-medium">{item.q}</summary>
            <p className="mt-2 text-sm text-neutral-500">{item.a}</p>
          </details>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
        <h2 className="font-medium">Still stuck?</h2>
        <p className="mt-1 text-sm text-neutral-500">
          This instance is run by whoever set it up for you — reach out to them directly for
          account or billing issues.
        </p>
      </div>
    </div>
  );
}
