// apps/web/src/components/Header.tsx
'use client';

import Link from 'next/link';
import type { Route } from 'next';
import type { UrlObject } from 'url';
import { motion } from 'framer-motion';

type Tab = { label: string; icon?: React.ReactNode; href: Route | UrlObject };

const tabs: Tab[] = [
  { label: 'Home',    href: '/' as Route },
  { label: 'Windows', href: '/category/windows' as Route },
  { label: 'macOS',   href: '/category/macos' as Route },
  { label: 'Android', href: '/category/android' as Route },
];

export default function Header() {
  return (
    <header className="relative isolate overflow-hidden rounded-2xl border px-4 py-5">
      {/* glow wrapper */}
      <div className="absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full blur-3xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 0.85, scale: 1 }}
          transition={{ duration: 1.2 }}
          style={{
            width: '100%',
            height: '100%',
            background:
              'radial-gradient(400px circle, rgba(56, 189, 248, .25), rgba(139, 92, 246, .25))',
          }}
        />
      </div>

      <div className="relative z-10 hidden items-center gap-1 md:flex">
        {tabs.map((t) => (
          <Link
            key={t.label}
            href={t.href}
            className="px-3 py-1.5 rounded-full text-sm hover:bg-white/10"
          >
            {t.icon ? <span className="mr-1">{t.icon}</span> : null}
            {t.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
