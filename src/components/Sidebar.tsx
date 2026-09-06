"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Role } from "@/lib/repo";

const PRIMARY_LINKS = [{ href: "/dashboard", label: "Dashboard", icon: "🏠" }];

const TOOL_LINKS = [
  { href: "/study", label: "Study Companion", icon: "📚" },
  { href: "/mock-interview", label: "Mock Interviewer", icon: "🎤" },
  { href: "/resume-questions", label: "Resume Questions", icon: "📄" },
  { href: "/locator-sandbox", label: "Locator Sandbox", icon: "🔍" },
];

function NavLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: string;
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
      <span aria-hidden>{icon}</span>
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
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-lg">
          🎓
        </span>
        <span className="text-lg font-bold">TestMentor AI</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {PRIMARY_LINKS.map((l) => (
          <NavLink key={l.href} {...l} active={pathname === l.href} />
        ))}
        {user.role === "ADMIN" && (
          <NavLink href="/admin" label="Admin" icon="⚙️" active={pathname === "/admin"} />
        )}

        <div className="mb-1 mt-5 px-3 text-xs font-medium uppercase tracking-wide text-neutral-400">
          Learning Tools
        </div>
        {TOOL_LINKS.map((l) => (
          <NavLink key={l.href} {...l} active={pathname === l.href} />
        ))}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
      >
        <span aria-hidden>↩️</span>
        Log out
      </button>
    </aside>
  );
}
