import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";

export default function OptionCard({
  icon: Icon,
  title,
  description,
  selected,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-1 items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
        selected
          ? "border-primary bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-950/30"
          : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700"
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          selected
            ? "bg-primary text-white"
            : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
        }`}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-neutral-500">{description}</p>
      </div>
      {selected && (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
          <Check className="h-3 w-3" aria-hidden />
        </span>
      )}
    </button>
  );
}
