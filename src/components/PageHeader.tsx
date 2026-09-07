import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

const COLORS = {
  blue: "from-blue-600 to-indigo-600",
  emerald: "from-emerald-500 to-teal-600",
  orange: "from-orange-500 to-amber-500",
  violet: "from-violet-600 to-fuchsia-600",
  rose: "from-rose-500 to-pink-600",
  amber: "from-amber-400 to-orange-500",
} as const;

export default function PageHeader({
  icon: Icon,
  title,
  description,
  color = "blue",
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  color?: keyof typeof COLORS;
  children?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${COLORS[color]} text-white shadow-sm`}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h1 className="text-xl font-semibold leading-tight">{title}</h1>
          {description && <p className="text-sm text-neutral-500">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}
