"use client";

import { useEffect, useRef, useState } from "react";
import {
  Anchor,
  Check,
  ChevronDown,
  Coffee,
  Flower2,
  Moon,
  RefreshCw,
  Sparkles,
  Sun,
  Sunset as SunsetIcon,
  Trees,
  type LucideIcon,
} from "lucide-react";

type ThemeId = "light" | "dark" | "navy" | "forest" | "sunset" | "paper" | "aurora" | "blossom";

const THEMES: { id: ThemeId; label: string; icon: LucideIcon; dark: boolean }[] = [
  { id: "light", label: "Light", icon: Sun, dark: false },
  { id: "dark", label: "Dark", icon: Moon, dark: true },
  { id: "navy", label: "Navy", icon: Anchor, dark: true },
  { id: "forest", label: "Forest", icon: Trees, dark: true },
  { id: "sunset", label: "Sunset", icon: SunsetIcon, dark: true },
  { id: "paper", label: "Paper", icon: Coffee, dark: false },
  { id: "aurora", label: "Aurora", icon: Sparkles, dark: true },
  { id: "blossom", label: "Blossom", icon: Flower2, dark: false },
];

const AUTO_CYCLE_KEY = "themeAutoCycle";
const CYCLE_INTERVAL_MS = 2 * 60 * 1000;

function applyTheme(id: ThemeId) {
  const meta = THEMES.find((t) => t.id === id) ?? THEMES[0];
  document.documentElement.classList.toggle("dark", meta.dark);
  document.documentElement.setAttribute("data-theme", meta.id);
  localStorage.setItem("theme", id);
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeId>("light");
  const [autoCycle, setAutoCycle] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reflect what the pre-paint init script (see layout.tsx) already applied.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme((document.documentElement.getAttribute("data-theme") as ThemeId) || "light");
    setAutoCycle(localStorage.getItem(AUTO_CYCLE_KEY) === "true");
  }, []);

  useEffect(() => {
    if (!autoCycle) return;
    const t = setInterval(() => {
      setTheme((current) => {
        const nextIndex = (THEMES.findIndex((th) => th.id === current) + 1) % THEMES.length;
        const next = THEMES[nextIndex].id;
        applyTheme(next);
        return next;
      });
    }, CYCLE_INTERVAL_MS);
    return () => clearInterval(t);
  }, [autoCycle]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function selectTheme(id: ThemeId) {
    applyTheme(id);
    setTheme(id);
    setOpen(false);
  }

  function toggleAutoCycle() {
    const next = !autoCycle;
    localStorage.setItem(AUTO_CYCLE_KEY, String(next));
    setAutoCycle(next);
  }

  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Change color theme"
        title="Change color theme"
        className="flex h-8 items-center gap-1 rounded-full px-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
      >
        <current.icon className="h-4 w-4" aria-hidden />
        <ChevronDown className="h-3 w-3 text-neutral-400" aria-hidden />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-52 rounded-lg border border-border-subtle bg-surface py-1 shadow-lg">
          <div className="border-b border-neutral-100 px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-neutral-400 dark:border-neutral-800">
            Theme
          </div>
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => selectTheme(t.id)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <t.icon className="h-4 w-4" aria-hidden />
              <span className="flex-1">{t.label}</span>
              {theme === t.id && (
                <Check className="h-3.5 w-3.5 text-primary dark:text-indigo-400" aria-hidden />
              )}
            </button>
          ))}
          <button
            type="button"
            onClick={toggleAutoCycle}
            className="flex w-full items-center gap-2 border-t border-neutral-100 px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-800"
          >
            <RefreshCw
              className={`h-4 w-4 ${autoCycle ? "text-primary dark:text-indigo-400" : "text-neutral-400"}`}
              aria-hidden
            />
            <span className="flex-1">Auto-cycle every 2 min</span>
            <span
              className={`relative h-4 w-7 shrink-0 rounded-full transition-colors ${
                autoCycle ? "bg-primary" : "bg-neutral-300 dark:bg-neutral-700"
              }`}
            >
              <span
                className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform ${
                  autoCycle ? "translate-x-3.5" : "translate-x-0.5"
                }`}
              />
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
