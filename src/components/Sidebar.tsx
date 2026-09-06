"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  ClipboardList,
  FileText,
  GraduationCap,
  HelpCircle,
  Home,
  LogOut,
  Mic,
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
];

const TOOL_LINKS = [
  { href: "/study", label: "Study Companion", icon: BookOpen },
  { href: "/mock-interview", label: "Mock Interviewer", icon: Mic },
  { href: "/exam", label: "Timed Exam", icon: ClipboardList },
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
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-gradient-to-r from-blue-600 to-indigo-600 font-medium text-white shadow-sm"
          : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
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
    <aside className="hidden w-64 shrink-0 flex-col border-r border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950 md:flex">
      <Link href="/" className="mb-6 flex items-center gap-2.5 px-1">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
          <GraduationCap className="h-5 w-5" aria-hidden />
        </span>
        <span className="text-lg font-bold">TestMentor AI</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {PRIMARY_LINKS.map((l) => (
          <NavLink key={l.href} {...l} active={pathname === l.href} />
        ))}
        {user.role === "ADMIN" && (
          <NavLink href="/admin" label="Admin" icon={Wrench} active={pathname === "/admin"} />
        )}

        <div className="mb-1 mt-5 px-3 text-xs font-medium uppercase tracking-wide text-neutral-400">
          Learning Tools
        </div>
        {TOOL_LINKS.map((l) => (
          <NavLink key={l.href} {...l} active={pathname === l.href} />
        ))}
      </nav>

      <div className="flex flex-col gap-1 border-t border-neutral-200 pt-3 dark:border-neutral-800">
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
        className="mt-3 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
      >
        <LogOut className="h-4 w-4" aria-hidden />
        Log out
      </button>
    </aside>
  );
}
