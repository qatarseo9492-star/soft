"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "./icons";
import clsx from "clsx";

const items = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" as const },
  { href: "/admin/software", label: "Software", icon: "software" as const },
  { href: "/admin/new", label: "New Software", icon: "create" as const },
  { href: "/admin/categories", label: "Categories", icon: "software" as const },
  { href: "/admin/settings", label: "Settings", icon: "settings" as const },
  { href: "/admin/profile", label: "My Profile", icon: "profile" as const },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 shrink-0 border-r border-white/10 bg-[radial-gradient(80rem_50rem_at_-10%_-20%,rgba(59,130,246,.12),transparent),radial-gradient(40rem_40rem_at_120%_110%,rgba(16,185,129,.07),transparent)]/cover p-4 md:block">
      <div className="flex items-center gap-2 px-2 pb-6">
        <div className="relative">
          {/* neon logo puck */}
          <div className="size-9 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-400 shadow-[0_0_25px_-2px_rgba(56,189,248,.75)]" />
          <div className="absolute inset-0 grid place-items-center">
            <Icons.logo className="size-4 text-white/95 drop-shadow-sm" />
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-white/80">Filespay Admin</p>
          <p className="text-[11px] text-white/40">control center</p>
        </div>
      </div>

      <nav className="space-y-1">
        {items.map((it) => {
          const Icon = Icons[it.icon];
          const active = pathname === it.href || pathname?.startsWith(it.href + "/");
          return (
            <Link
              key={it.href}
              href={it.href}
              className={clsx(
                "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                active
                  ? "bg-white/10 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,.06)]"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className="size-4 opacity-80 group-hover:opacity-100" />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-3 text-white/70">
        <p className="text-xs leading-5">
          Tip: upload screenshots and featured images using the new **S3 Uploader** on the New Software page.
        </p>
      </div>
    </aside>
  );
}
