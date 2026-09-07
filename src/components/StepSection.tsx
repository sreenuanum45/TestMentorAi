import type { ReactNode } from "react";

export default function StepSection({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-6 first:mt-0">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
          {step}
        </span>
        <h2 className="font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}
