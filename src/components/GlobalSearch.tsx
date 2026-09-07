"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Bookmark,
  ClipboardList,
  Code2,
  FileText,
  Search,
  History,
  Home,
  HelpCircle,
  Mic,
  NotebookPen,
  Repeat,
  Settings,
  Sparkles,
  User,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/repo";

const PAGES: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/review", label: "Review", icon: Repeat },
  { href: "/exams", label: "Exam History", icon: History },
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/notes", label: "Notes", icon: NotebookPen },
  { href: "/study", label: "Study Companion", icon: BookOpen },
  { href: "/mock-interview", label: "Mock Interviewer", icon: Mic },
  { href: "/exam", label: "Timed Exam", icon: ClipboardList },
  { href: "/coding", label: "Coding Practice", icon: Code2 },
  { href: "/resume-questions", label: "Resume Questions", icon: FileText },
  { href: "/locator-sandbox", label: "Locator Sandbox", icon: Search },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/help", label: "Help & Support", icon: HelpCircle },
  { href: "/pro", label: "Upgrade to Pro", icon: Sparkles },
];

export default function GlobalSearch({ role }: { role: Role }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const pages = role === "ADMIN" ? [...PAGES, { href: "/admin", label: "Admin", icon: Wrench }] : PAGES;
  const filtered = query.trim()
    ? pages.filter((p) => p.label.toLowerCase().includes(query.trim().toLowerCase()))
    : pages;

  function openSearch() {
    setQuery("");
    setActiveIndex(0);
    setOpen(true);
  }

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) {
          setOpen(false);
        } else {
          openSearch();
        }
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  function navigate(href: string) {
    setOpen(false);
    router.push(href);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = filtered[activeIndex];
      if (target) navigate(target.href);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openSearch}
        className="hidden flex-1 items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm text-neutral-400 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 md:flex md:max-w-xs"
      >
        <Search className="h-4 w-4 shrink-0" aria-hidden />
        <span className="flex-1 truncate text-left">Search anything…</span>
        <kbd className="shrink-0 rounded border border-neutral-300 px-1.5 py-0.5 text-[10px] dark:border-neutral-700">
          Ctrl+K
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-24"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-border-subtle bg-surface shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-neutral-200 px-3 py-2.5 dark:border-neutral-800">
              <Search className="h-4 w-4 text-neutral-400" aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search pages…"
                className="flex-1 bg-transparent text-sm focus:outline-none"
              />
              <kbd className="rounded border border-neutral-300 px-1.5 py-0.5 text-[10px] dark:border-neutral-700">
                Esc
              </kbd>
            </div>
            <div className="max-h-80 overflow-y-auto p-1.5">
              {filtered.length === 0 && (
                <p className="px-3 py-4 text-center text-sm text-neutral-400">No pages found</p>
              )}
              {filtered.map((p, i) => (
                <button
                  key={p.href}
                  type="button"
                  onClick={() => navigate(p.href)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm ${
                    i === activeIndex
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                      : ""
                  }`}
                >
                  <p.icon className="h-4 w-4" aria-hidden />
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
