// apps/web/src/components/site/SiteHeader.tsx
'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { motion } from 'framer-motion';

type Tab = { label: string; href: Route };

const tabs: Tab[] = [
  { label: 'Home',    href: '/' as Route },
  { label: 'Windows', href: '/category/windows' as Route },
  { label: 'macOS',   href: '/category/macos' as Route },
  { label: 'Android', href: '/category/android' as Route },
];

export default function SiteHeader() {
  return (
    <header className="relative isolate">
      {/* background glow wrapper */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ duration: 1.2 }}
          style={{
            width: '100%',
            height: '100%',
            background:
              'radial-gradient(800px circle at 10% -10%, rgba(56, 189, 248, .18), transparent 40%), radial-gradient(900px circle at 90% -10%, rgba(139, 92, 246, .18), transparent 40%)',
          }}
        />
      </div>

      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-4">
        <Link href="/" className="text-lg font-bold">FilesPay</Link>
        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {tabs.map((t) => (
            <Link
              key={t.label}
              href={t.href}
              className="px-3 py-1.5 rounded-full text-sm hover:bg-white/10"
            >
              {t.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">{/* actions */}</div>
      </div>
    </header>
  );
}
