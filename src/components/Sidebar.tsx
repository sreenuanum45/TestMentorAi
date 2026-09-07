"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Bookmark,
  ClipboardList,
  Code2,
  FileText,
  GraduationCap,
  HelpCircle,
  History,
  Home,
  LogOut,
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

const PRIMARY_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/review", label: "Review", icon: Repeat },
  { href: "/exams", label: "Exam History", icon: History },
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/notes", label: "Notes", icon: NotebookPen },
];

const TOOL_LINKS = [
  { href: "/study", label: "Study Companion", icon: BookOpen },
  { href: "/mock-interview", label: "Mock Interviewer", icon: Mic },
  { href: "/exam", label: "Timed Exam", icon: ClipboardList },
  { href: "/coding", label: "Coding Practice", icon: Code2 },
  { href: "/resume-questions", label: "Resume Questions", icon: FileText },
  { href: "/locator-sandbox", label: "Locator Sandbox", icon: Search },
];

const ACCOUNT_LINKS = [
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/help", label: "Help & Support", icon: HelpCircle },
];

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-all ${
        active
          ? "bg-primary font-medium text-white shadow-sm"
          : "text-neutral-600 hover:translate-x-0.5 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
      }`}
    >
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-colors ${
          active
            ? "bg-white/15"
            : "bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:group-hover:bg-neutral-700"
        }`}
      >
        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
      </span>
      {label}
    </Link>
  );
}

export default function Sidebar({ user }: { user: { email: string; role: Role } }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto border-r border-border-subtle bg-surface p-4 md:flex">
      <Link href="/" className="mb-6 flex items-center gap-2.5 px-1">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
          <GraduationCap className="h-5 w-5" aria-hidden />
        </span>
        <span>
          <span className="block text-lg font-bold leading-tight">TestMentor AI</span>
          <span className="block text-[11px] leading-tight text-neutral-400">
            Practice. Prepare. Progress.
          </span>
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {PRIMARY_LINKS.map((l) => (
          <NavLink key={l.href} {...l} active={pathname === l.href} />
        ))}
        {user.role === "ADMIN" && (
          <NavLink href="/admin" label="Admin" icon={Wrench} active={pathname === "/admin"} />
        )}

        <div className="mb-1 mt-5 flex items-center gap-1.5 px-2.5 text-xs font-semibold uppercase tracking-wide text-neutral-400">
          <span className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-600" aria-hidden />
          Learning Tools
        </div>
        {TOOL_LINKS.map((l) => (
          <NavLink key={l.href} {...l} active={pathname === l.href} />
        ))}
      </nav>

      <div className="flex flex-col gap-1 border-t border-border-subtle pt-3">
        {ACCOUNT_LINKS.map((l) => (
          <NavLink key={l.href} {...l} active={pathname === l.href} />
        ))}
      </div>

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

      <button
        type="button"
        onClick={handleLogout}
        className="mt-3 flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
          <LogOut className="h-3.5 w-3.5" aria-hidden />
        </span>
        Log out
      </button>
    </aside>
  );
}
