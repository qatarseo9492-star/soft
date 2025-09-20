"use client";

import { Icons } from "./icons";

export default function Header({ title }: { title: string }) {
  const Logo = Icons.logo;
  return (
    <header className="sticky top-0 z-10 -mx-6 mb-6 border-b border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,.9),rgba(15,23,42,.7))] px-6 backdrop-blur">
      <div className="container-max flex h-14 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative grid size-8 place-items-center rounded-xl bg-gradient-to-tr from-indigo-500 via-sky-500 to-emerald-400 text-white shadow-[0_8px_30px_rgba(59,130,246,.35)] ring-1 ring-white/20">
            <Logo className="size-4" />
          </div>
          <h1 className="text-base font-semibold text-white/90">{title}</h1>
        </div>
        <div className="text-[11px] text-white/50">Dark</div>
      </div>
    </header>
  );
}
