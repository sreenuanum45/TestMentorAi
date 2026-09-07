import { Heart, HelpCircle, Mail, Phone } from "lucide-react";
import PageHeader from "@/components/PageHeader";

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
      <PageHeader
        icon={HelpCircle}
        title="Help & Support"
        description="Common questions about how TestMentor AI works."
        color="rose"
      />

      <div className="space-y-3">
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
          Reach out directly for account or billing issues, bug reports, or feature requests.
        </p>
        <div className="mt-3 flex flex-col gap-2 text-sm">
          <a
            href="tel:+917416472820"
            className="flex items-center gap-2 text-primary hover:underline dark:text-indigo-400"
          >
            <Phone className="h-4 w-4" aria-hidden />
            +91 74164 72820
          </a>
          <a
            href="mailto:anumandlasreenu@gmail.com"
            className="flex items-center gap-2 text-primary hover:underline dark:text-indigo-400"
          >
            <Mail className="h-4 w-4" aria-hidden />
            anumandlasreenu@gmail.com
          </a>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/30">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white">
          <Heart className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <h2 className="font-medium text-amber-900 dark:text-amber-200">Support this project</h2>
          <p className="mt-1 text-sm text-amber-700/80 dark:text-amber-300/70">
            TestMentor AI is a solo-built project. If it helped with your interview prep and
            you&apos;d like to contribute toward hosting and API costs, reach out on the phone
            number or email above and we&apos;ll sort out the details directly.
          </p>
        </div>
      </div>
    </div>
  );
}
