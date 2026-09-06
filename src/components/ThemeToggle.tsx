"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Reflect the class the pre-paint init script already applied.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setIsDark(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle color theme"
      title="Toggle color theme"
      className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
    >
      {isDark ? <Moon className="h-4 w-4" aria-hidden /> : <Sun className="h-4 w-4" aria-hidden />}
    </button>
  );
}
