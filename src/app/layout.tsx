import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { getCurrentUser } from "@/lib/auth";
import { listExamsForUser } from "@/lib/repo";

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var DARK_THEMES = ["dark", "navy", "forest", "sunset", "aurora"];
    var theme = localStorage.getItem("theme") || "light";
    document.documentElement.classList.toggle("dark", DARK_THEMES.indexOf(theme) !== -1);
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {}
})();
`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TestMentor AI",
  description: "QA engineering interview coach — study companion and mock interviewer",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await getCurrentUser();
  const user = session ? { email: session.email, role: session.role } : null;
  const recentExams = session ? await listExamsForUser(session.sub, 3) : [];
  const notifications = recentExams.map((e) => ({
    id: e.id,
    text: `Scored ${e.total > 0 ? Math.round((e.score / e.total) * 100) : 0}% on a ${e.focus} exam`,
    date: e.created_at,
  }));

  return (
    <html
      lang="en"
      // The pre-paint theme script below sets the `dark` class and `data-theme`
      // attribute before React hydrates, intentionally differing from the
      // server-rendered markup.
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex bg-background text-foreground">
        {user && <Sidebar user={user} />}
        <div className="flex min-h-full flex-1 flex-col">
          <TopBar user={user} notifications={notifications} />
          <main className="flex flex-1 flex-col">{children}</main>
        </div>
      </body>
    </html>
  );
}
