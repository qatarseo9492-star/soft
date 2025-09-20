// src/components/admin/AdminShell.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PackagePlus,
  PackageSearch,
  Settings,
  FolderTree,
  UserCircle,
  Sun,
  Moon,
} from "lucide-react";
import { useEffect, useState } from "react";
import clsx from "clsx";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/software", label: "Software", icon: PackageSearch },
  { href: "/admin/software/new", label: "New Software", icon: PackagePlus },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/profile", label: "My Profile", icon: UserCircle },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [dark]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      {/* Top header */}
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--card)]/70 backdrop-blur-md">
        <div className="container-max flex items-center justify-between py-3">
          <Link
            href="/admin"
            className="flex items-center gap-3 group"
            title="Filespay Admin"
          >
            {/* Colorful logo orb */}
            <span className="relative block h-8 w-8 rounded-2xl shadow-brand">
              <span className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_top_left,var(--brand-400),transparent_60%)]" />
              <span className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_bottom_right,var(--brand-600),transparent_60%)] mix-blend-screen" />
            </span>
            <span className="text-lg font-semibold tracking-wide">
              Filespay <span className="opacity-60">Admin</span>
            </span>
          </Link>

          <button
            onClick={() => setDark((v) => !v)}
            className="btn btn-muted rounded-xl px-3 py-2"
            title={dark ? "Switch to light" : "Switch to dark"}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="container-max grid grid-cols-12 gap-6 py-6">
        <aside className="col-span-12 md:col-span-3 lg:col-span-2">
          <nav className="card p-2">
            {nav.map((item) => {
              const active =
                pathname === item.href || pathname?.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm",
                    active
                      ? "bg-[var(--brand-600)]/90 text-white shadow-brand"
                      : "hover:bg-[var(--muted)]"
                  )}
                >
                  <Icon size={16} className={clsx(!active && "opacity-70")} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 rounded-2xl p-4 text-sm text-neutral-500 dark:text-neutral-400"
               style={{
                 background:
                   "radial-gradient(120px 80px at 20% 10%, rgba(34,211,238,.15), transparent), radial-gradient(120px 80px at 90% 90%, rgba(139,92,246,.15), transparent)",
                 border: "1px solid var(--border)",
               }}>
            Tip: use the sidebar to manage software, categories, and settings.
          </div>
        </aside>

        <main className="col-span-12 md:col-span-9 lg:col-span-10">
          <div className="card p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
