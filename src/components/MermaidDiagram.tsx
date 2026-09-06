"use client";

import { useEffect, useId, useRef, useState } from "react";
import mermaid from "mermaid";

export default function MermaidDiagram({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const isDark = document.documentElement.classList.contains("dark");
    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? "dark" : "neutral",
      securityLevel: "strict",
      fontFamily: "inherit",
      // Without this, a parse error draws mermaid's own full-page error banner
      // instead of rejecting the render() promise for our catch block below.
      suppressErrorRendering: true,
    });

    mermaid
      .render(`mermaid-${id}`, code)
      .then(({ svg }) => {
        if (!cancelled && ref.current) ref.current.innerHTML = svg;
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to render diagram");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [code, id]);

  if (error) {
    return (
      <pre className="overflow-x-auto rounded-lg bg-neutral-900 p-3 text-xs text-neutral-100">
        {code}
      </pre>
    );
  }

  return <div ref={ref} className="my-2 flex justify-center overflow-x-auto [&_svg]:max-w-full" />;
}
