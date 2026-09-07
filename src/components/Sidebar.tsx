"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Bookmark,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Code2,
  FileSearch,
  FileText,
  GraduationCap,
  HelpCircle,
  History,
  Home,
  LogOut,
  Mail,
  Mic,
  NotebookPen,
  Repeat,
  Search,
  Settings,
  Sparkles,
  User,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/repo";

const COLLAPSED_KEY = "sidebarCollapsed";

const ICON_COLORS = {
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
  emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
  orange: "bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400",
  cyan: "bg-cyan-100 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400",
  violet: "bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400",
  rose: "bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400",
  indigo: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400",
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
  teal: "bg-teal-100 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400",
  pink: "bg-pink-100 text-pink-600 dark:bg-pink-950/50 dark:text-pink-400",
  sky: "bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400",
  slate: "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  red: "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400",
} as const;

type IconColor = keyof typeof ICON_COLORS;

const PRIMARY_LINKS: { href: string; label: string; icon: LucideIcon; color: IconColor }[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home, color: "indigo" },
  { href: "/daily-challenge", label: "Daily Challenge", icon: CalendarCheck, color: "orange" },
  { href: "/review", label: "Review", icon: Repeat, color: "amber" },
  { href: "/exams", label: "Exam History", icon: History, color: "teal" },
  { href: "/saved", label: "Saved", icon: Bookmark, color: "pink" },
  { href: "/notes", label: "Notes", icon: NotebookPen, color: "sky" },
];

const TOOL_LINKS: { href: string; label: string; icon: LucideIcon; color: IconColor }[] = [
  { href: "/study", label: "Study Companion", icon: BookOpen, color: "blue" },
  { href: "/mock-interview", label: "Mock Interviewer", icon: Mic, color: "emerald" },
  { href: "/exam", label: "Timed Exam", icon: ClipboardList, color: "orange" },
  { href: "/coding", label: "Coding Practice", icon: Code2, color: "cyan" },
  { href: "/resume-questions", label: "Resume Questions", icon: FileText, color: "violet" },
  { href: "/resume-review", label: "Resume Reviewer", icon: FileSearch, color: "teal" },
  { href: "/cover-letter", label: "Cover Letter", icon: Mail, color: "pink" },
  { href: "/locator-sandbox", label: "Locator Sandbox", icon: Search, color: "rose" },
];

const ACCOUNT_LINKS: { href: string; label: string; icon: LucideIcon; color: IconColor }[] = [
  { href: "/profile", label: "Profile", icon: User, color: "violet" },
  { href: "/settings", label: "Settings", icon: Settings, color: "slate" },
  { href: "/help", label: "Help & Support", icon: HelpCircle, color: "emerald" },
];

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
  color,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  collapsed: boolean;
  color?: IconColor;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex items-center gap-2.5 rounded-xl py-2 text-sm transition-all ${
        collapsed ? "justify-center px-2" : "px-2.5"
      } ${
        active
          ? "bg-primary font-medium text-white shadow-sm"
          : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
      }`}
    >
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-colors ${
          active
            ? "bg-white/15"
            : color
              ? ICON_COLORS[color]
              : "bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:group-hover:bg-neutral-700"
        }`}
      >
        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
      </span>
      {collapsed ? (
        <span className="pointer-events-none absolute left-full z-30 ml-3 whitespace-nowrap rounded-lg bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-neutral-100 dark:text-neutral-900">
          {label}
        </span>
      ) : (
        label
      )}
    </Link>
  );
}

export default function Sidebar({ user }: { user: { email: string; role: Role } }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // Reflect the user's saved preference after mount (localStorage isn't
    // available during server rendering, so this can't be the initial state).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollapsed(localStorage.getItem(COLLAPSED_KEY) === "true");
  }, []);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(COLLAPSED_KEY, String(next));
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <aside
      className={`sticky top-0 hidden h-screen shrink-0 flex-col overflow-y-auto overflow-x-hidden border-r border-border-subtle bg-surface transition-[width] duration-200 md:flex ${
        collapsed ? "w-[4.5rem] p-3" : "w-64 p-4"
      }`}
    >
      <div className={`mb-4 flex items-center gap-2.5 px-1 ${collapsed ? "justify-center" : "justify-between"}`}>
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
            <GraduationCap className="h-5 w-5" aria-hidden />
          </span>
          {!collapsed && (
            <span className="whitespace-nowrap">
              <span className="block text-lg font-bold leading-tight">TestMentor AI</span>
              <span className="block text-[11px] leading-tight text-neutral-400">
                Practice. Prepare. Progress.
              </span>
            </span>
          )}
        </Link>
        {!collapsed && (
          <button
            type="button"
            onClick={toggleCollapsed}
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>
      {collapsed && (
        <button
          type="button"
          onClick={toggleCollapsed}
          title="Expand sidebar"
          aria-label="Expand sidebar"
          className="mb-4 flex h-7 w-full items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      )}

      <nav className="flex flex-1 flex-col gap-1">
        {PRIMARY_LINKS.map((l) => (
          <NavLink key={l.href} {...l} active={pathname === l.href} collapsed={collapsed} />
        ))}
        {user.role === "ADMIN" && (
          <NavLink
            href="/admin"
            label="Admin"
            icon={Wrench}
            color="slate"
            active={pathname === "/admin"}
            collapsed={collapsed}
          />
        )}

        {collapsed ? (
          <div className="my-3 border-t border-border-subtle" aria-hidden />
        ) : (
          <div className="mb-1 mt-5 flex items-center gap-1.5 px-2.5 text-xs font-semibold uppercase tracking-wide text-neutral-400">
            <span className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-600" aria-hidden />
            Learning Tools
          </div>
        )}
        {TOOL_LINKS.map((l) => (
          <NavLink key={l.href} {...l} active={pathname === l.href} collapsed={collapsed} />
        ))}
      </nav>

      <div className="flex flex-col gap-1 border-t border-border-subtle pt-3">
        {ACCOUNT_LINKS.map((l) => (
          <NavLink key={l.href} {...l} active={pathname === l.href} collapsed={collapsed} />
        ))}
      </div>

      {collapsed ? (
        <Link
          href="/pro"
          title="Upgrade to Pro"
          className="group relative mt-3 flex items-center justify-center rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-2 transition-colors hover:from-amber-100 hover:to-orange-100 dark:border-amber-900 dark:from-amber-950/40 dark:to-orange-950/40"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
          </span>
          <span className="pointer-events-none absolute left-full z-30 ml-3 whitespace-nowrap rounded-lg bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-neutral-100 dark:text-neutral-900">
            Upgrade to Pro
          </span>
        </Link>
      ) : (
        <Link
          href="/pro"
          className="mt-3 flex items-center gap-3 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-3 transition-colors hover:from-amber-100 hover:to-orange-100 dark:border-amber-900 dark:from-amber-950/40 dark:to-orange-950/40"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
          <div className="text-sm">
            <p className="font-medium text-amber-900 dark:text-amber-200">Upgrade to Pro</p>
            <p className="text-xs text-amber-700/80 dark:text-amber-300/70">
              More practice & analytics
            </p>
          </div>
        </Link>
      )}

      <button
        type="button"
        onClick={handleLogout}
        title={collapsed ? "Log out" : undefined}
        className={`group relative mt-3 flex items-center gap-2.5 rounded-xl py-2 text-sm text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 ${
          collapsed ? "justify-center px-2" : "px-2.5"
        }`}
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
          <LogOut className="h-3.5 w-3.5" aria-hidden />
        </span>
        {collapsed ? (
          <span className="pointer-events-none absolute left-full z-30 ml-3 whitespace-nowrap rounded-lg bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-neutral-100 dark:text-neutral-900">
            Log out
          </span>
        ) : (
          "Log out"
        )}
      </button>
    </aside>
  );
}
