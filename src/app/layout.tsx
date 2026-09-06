import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { getCurrentUser } from "@/lib/auth";

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var isDark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", isDark);
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

  return (
    <html
      lang="en"
      // The pre-paint theme script below adds a `dark` class before React hydrates,
      // which intentionally differs from the server-rendered class attribute.
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex bg-background text-foreground">
        {user && <Sidebar user={user} />}
        <div className="flex min-h-full flex-1 flex-col">
          <TopBar user={user} />
          <main className="flex flex-1 flex-col">{children}</main>
        </div>
      </body>
    </html>
  );
}
