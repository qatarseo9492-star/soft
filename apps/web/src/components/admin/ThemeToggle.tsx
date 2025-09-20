"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("theme-dark");
    const isDark = saved !== "false";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("theme-dark", String(next));
    document.documentElement.classList.toggle("dark", next);
  };

  return (
    <button
      onClick={toggle}
      className="btn btn-muted text-xs px-3 py-1 rounded-lg border border-white/10"
      aria-label="Toggle dark theme"
      title="Toggle dark theme"
    >
      {dark ? "Dark" : "Light"}
    </button>
  );
}
