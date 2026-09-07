"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  BookOpen,
  Bookmark,
  ChevronDown,
  ClipboardList,
  Code2,
  FileText,
  GraduationCap,
  History,
  Mic,
  NotebookPen,
  Repeat,
  Search,
  Sparkles,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import GlobalSearch from "@/components/GlobalSearch";
import type { Role } from "@/lib/repo";

const FEATURE_LINKS = [
  { href: "/study", label: "Study Companion", icon: BookOpen },
  { href: "/mock-interview", label: "Mock Interviewer", icon: Mic },
  { href: "/exam", label: "Timed Exam", icon: ClipboardList },
  { href: "/coding", label: "Coding Practice", icon: Code2 },
  { href: "/resume-questions", label: "Resume Questions", icon: FileText },
  { href: "/locator-sandbox", label: "Locator Sandbox", icon: Search },
];

export interface Notification {
  id: string;
  text: string;
  date: Date | string;
}

export default function TopBar({
  user,
  notifications = [],
}: {
  user: { email: string; role: Role } | null;
  notifications?: Notification[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-10 border-b border-border-subtle bg-surface/80 shadow-sm backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
        {!user ? (
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <GraduationCap className="h-4 w-4" aria-hidden />
            </span>
            <span className="font-bold">TestMentor AI</span>
          </Link>
        ) : (
          <nav className="flex flex-wrap items-center gap-1">
            <Link href="/" className="mr-1 flex items-center gap-2 md:hidden">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white">
                <GraduationCap className="h-4 w-4" aria-hidden />
              </span>
            </Link>
            {FEATURE_LINKS.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? "bg-primary text-white"
                      : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  }`}
                >
                  <l.icon className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="hidden sm:inline">{l.label}</span>
                </Link>
              );
            })}
          </nav>
        )}

        {user && <GlobalSearch role={user.role} />}

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((o) => !o)}
                aria-label="Notifications"
                className="relative flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <Bell className="h-4 w-4" aria-hidden />
                {notifications.length > 0 && (
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
                )}
              </button>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-72 rounded-lg border border-border-subtle bg-surface py-1 shadow-lg">
                    <div className="border-b border-neutral-100 px-3 py-2 text-xs font-medium uppercase tracking-wide text-neutral-400 dark:border-neutral-800">
                      Notifications
                    </div>
                    {notifications.length === 0 ? (
                      <p className="px-3 py-3 text-sm text-neutral-400">
                        Nothing yet — take a timed exam to see results here.
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800">
                          <p>{n.text}</p>
                          <p className="text-xs text-neutral-400">
                            {new Date(n.date).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          )}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-medium text-white">
                  {user.email[0]?.toUpperCase()}
                </span>
                <span className="hidden text-left text-sm sm:block">
                  <span className="block max-w-[12rem] truncate font-medium leading-tight">
                    {user.email}
                  </span>
                  <span className="block text-xs leading-tight text-neutral-400">
                    {user.role === "ADMIN" ? "Admin" : "Student"}
                  </span>
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-neutral-400" aria-hidden />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-44 rounded-lg border border-border-subtle bg-surface py-1 shadow-lg">
                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 md:hidden"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/review"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 md:hidden"
                    >
                      <Repeat className="h-3.5 w-3.5" aria-hidden />
                      Review
                    </Link>
                    <Link
                      href="/exams"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 md:hidden"
                    >
                      <History className="h-3.5 w-3.5" aria-hidden />
                      Exam History
                    </Link>
                    <Link
                      href="/saved"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 md:hidden"
                    >
                      <Bookmark className="h-3.5 w-3.5" aria-hidden />
                      Saved
                    </Link>
                    <Link
                      href="/notes"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 md:hidden"
                    >
                      <NotebookPen className="h-3.5 w-3.5" aria-hidden />
                      Notes
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="block px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 md:hidden"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setMenuOpen(false)}
                      className="block px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 md:hidden"
                    >
                      Settings
                    </Link>
                    <Link
                      href="/help"
                      onClick={() => setMenuOpen(false)}
                      className="block px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 md:hidden"
                    >
                      Help & Support
                    </Link>
                    <Link
                      href="/pro"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-amber-600 hover:bg-neutral-100 dark:text-amber-400 dark:hover:bg-neutral-800 md:hidden"
                    >
                      <Sparkles className="h-3.5 w-3.5" aria-hidden />
                      Upgrade to Pro
                    </Link>
                    {user.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="block px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 md:hidden"
                      >
                        Admin
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm text-neutral-500 hover:underline">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-primary px-3 py-1.5 text-sm text-white hover:bg-primary-hover"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
