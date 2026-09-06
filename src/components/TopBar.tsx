"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import type { Role } from "@/lib/repo";

const FEATURE_LINKS = [
  { href: "/study", label: "Study Companion", icon: "📚" },
  { href: "/mock-interview", label: "Mock Interviewer", icon: "🎤" },
  { href: "/exam", label: "Timed Exam", icon: "📝" },
  { href: "/resume-questions", label: "Resume Questions", icon: "📄" },
  { href: "/locator-sandbox", label: "Locator Sandbox", icon: "🔍" },
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
    <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-black/80">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
        {!user ? (
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-base">
              🎓
            </span>
            <span className="font-bold">TestMentor AI</span>
          </Link>
        ) : (
          <nav className="flex flex-1 flex-wrap items-center gap-1">
            <Link href="/" className="mr-1 flex items-center gap-2 md:hidden">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-sm">
                🎓
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
                      ? "bg-blue-600 text-white"
                      : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  }`}
                >
                  <span aria-hidden>{l.icon}</span>
                  <span className="hidden sm:inline">{l.label}</span>
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((o) => !o)}
                aria-label="Notifications"
                className="relative flex h-8 w-8 items-center justify-center rounded-full text-base hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                🔔
                {notifications.length > 0 && (
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
                )}
              </button>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-72 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
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
                <span aria-hidden className="text-xs text-neutral-400">
                  ▾
                </span>
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-44 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="block px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 md:hidden"
                    >
                      Dashboard
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
                className="rounded-full bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
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
