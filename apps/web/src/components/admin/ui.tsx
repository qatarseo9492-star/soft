"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home as HomeIcon, User2 } from "lucide-react";
import ThemeToggle from "@/components/site/ThemeToggle";
import { ReactNode } from "react";

export function clsx(...xs: Array<string | undefined | false | null>) {
  return xs.filter(Boolean).join(" ");
}

/* ============================ AdminToolbar ============================ */
export type AdminToolbarProps = {
  backHref?: Route | string;
  homeHref: Route | string;
  moreHref?: Route | string;
  showProfile?: boolean;
  showThemeToggle?: boolean;
};

export function AdminToolbar({
  backHref,
  homeHref,
  moreHref,
  showProfile = true,
  showThemeToggle = true,
}: AdminToolbarProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <button
          className="rounded-xl border px-2.5 py-2 hover:bg-accent/10 transition"
          aria-label="Back"
          onClick={() => (backHref ? router.push(backHref as Route) : router.back())}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <Link href={homeHref as Route} aria-label="Home" className="rounded-xl border px-2.5 py-2 hover:bg-accent/10 transition">
          <HomeIcon className="h-4 w-4" />
        </Link>
      </div>

      <div className="flex items-center gap-2">
        {showThemeToggle && <ThemeToggle />}
        {showProfile && (
          <Link
            href={(moreHref || "/admin") as Route}
            className="rounded-xl border px-2.5 py-2 hover:bg-accent/10 transition inline-flex items-center gap-2"
          >
            <User2 className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </Link>
        )}
      </div>
    </div>
  );
}

/* ============================ GradientHeader ============================ */
export function GradientHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="glass p-4 sm:p-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gradient">{title}</h1>
        {subtitle && <p className="text-sm text-subtle mt-1">{subtitle}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

/* =============================== Stats =============================== */
export function StatGrid({ children }: { children: ReactNode }) {
  return <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{children}</div>;
}
export function StatCard({
  label,
  value,
  tone = "violet",
  extra,
}: {
  label: string;
  value: ReactNode;
  tone?: "violet" | "indigo" | "emerald" | "orange";
  extra?: ReactNode;
}) {
  const toneMap: Record<string, string> = {
    violet: "from-violet-500/30 to-transparent",
    indigo: "from-indigo-500/30 to-transparent",
    emerald: "from-emerald-500/30 to-transparent",
    orange: "from-orange-500/30 to-transparent",
  };
  return (
    <div className="soft-card p-4 relative overflow-hidden">
      <div className={clsx("absolute inset-0 pointer-events-none bg-gradient-to-br", toneMap[tone])} />
      <div className="relative">
        <div className="text-xs text-subtle">{label}</div>
        <div className="text-2xl font-semibold mt-1">{value}</div>
        {extra && <div className="mt-2">{extra}</div>}
      </div>
    </div>
  );
}

/* ============================ StatusPill ============================ */
export function StatusPill({ published }: { published: boolean }) {
  return (
    <span className={clsx("badge", published ? "badge-success" : "badge-warning")}>
      {published ? "Published" : "Draft"}
    </span>
  );
}
