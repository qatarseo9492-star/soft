"use client";

import { useEffect, useState } from "react";
import { Moon, SunMedium } from "lucide-react";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"dim" | "light">("dim");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("theme")) as "dim" | "light" | null;
    const initial = saved ?? "dim";
    setTheme(initial);
    document.documentElement.classList.toggle("light", initial === "light");
  }, []);

  function toggle() {
    const next = theme === "light" ? "dim" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("light", next === "light");
    try { localStorage.setItem("theme", next); } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className={`inline-flex items-center justify-center rounded-xl border px-2.5 py-2 hover:bg-accent/10 transition ${className}`}
      title={theme === "light" ? "Switch to Dim" : "Switch to Light"}
    >
      {theme === "light" ? <Moon className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
    </button>
  );
}
