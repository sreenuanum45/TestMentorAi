import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

const GRADIENTS = {
  blue: {
    bg: "from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-purple-950/40",
    text: "from-blue-600 via-indigo-600 to-purple-600",
    icon: "from-blue-600 to-indigo-600",
    tagline: "text-indigo-400 dark:text-indigo-300",
  },
  emerald: {
    bg: "from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-cyan-950/40",
    text: "from-emerald-600 via-teal-600 to-cyan-600",
    icon: "from-emerald-500 to-teal-600",
    tagline: "text-teal-500 dark:text-teal-300",
  },
  orange: {
    bg: "from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/40 dark:via-amber-950/40 dark:to-yellow-950/40",
    text: "from-orange-600 via-amber-600 to-yellow-600",
    icon: "from-orange-500 to-amber-500",
    tagline: "text-amber-500 dark:text-amber-300",
  },
  violet: {
    bg: "from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/40 dark:via-purple-950/40 dark:to-fuchsia-950/40",
    text: "from-violet-600 via-purple-600 to-fuchsia-600",
    icon: "from-violet-600 to-fuchsia-600",
    tagline: "text-fuchsia-400 dark:text-fuchsia-300",
  },
  rose: {
    bg: "from-rose-50 via-pink-50 to-red-50 dark:from-rose-950/40 dark:via-pink-950/40 dark:to-red-950/40",
    text: "from-rose-600 via-pink-600 to-red-600",
    icon: "from-rose-500 to-pink-600",
    tagline: "text-pink-400 dark:text-pink-300",
  },
  amber: {
    bg: "from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/40 dark:via-orange-950/40 dark:to-yellow-950/40",
    text: "from-amber-500 via-orange-500 to-yellow-500",
    icon: "from-amber-400 to-orange-500",
    tagline: "text-orange-400 dark:text-orange-300",
  },
  cyan: {
    bg: "from-cyan-50 via-sky-50 to-blue-50 dark:from-cyan-950/40 dark:via-sky-950/40 dark:to-blue-950/40",
    text: "from-cyan-600 via-sky-600 to-blue-600",
    icon: "from-cyan-500 to-sky-600",
    tagline: "text-sky-400 dark:text-sky-300",
  },
} as const;

export type PageHeroColor = keyof typeof GRADIENTS;

export default function PageHero({
  icon: Icon,
  eyebrow,
  title,
  description,
  tagline,
  color = "blue",
  illustration,
  children,
}: {
  icon: LucideIcon;
  eyebrow?: string;
  title: string;
  description: string;
  tagline?: string;
  color?: PageHeroColor;
  illustration?: ReactNode;
  children?: ReactNode;
}) {
  const g = GRADIENTS[color];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${g.bg} p-6 sm:p-8`}
    >
      <div className="relative z-10 max-w-md">
        <div className="mb-3 flex items-center gap-3">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${g.icon} text-white shadow-sm`}
          >
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          {eyebrow && <p className="text-sm font-medium text-neutral-500">{eyebrow}</p>}
        </div>
        <h1
          className={`bg-gradient-to-r ${g.text} bg-clip-text text-3xl font-extrabold text-transparent drop-shadow-sm sm:text-4xl`}
        >
          {title}
        </h1>
        <p className="mt-2 text-sm text-neutral-500">{description}</p>
        {children}
      </div>
      {illustration}
      {tagline && (
        <p
          className={`pointer-events-none absolute right-6 top-4 hidden max-w-[9rem] text-right text-xs font-medium sm:block ${g.tagline}`}
        >
          {tagline}
        </p>
      )}
    </div>
  );
}
