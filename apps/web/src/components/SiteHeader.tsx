// apps/web/src/components/SiteHeader.tsx
"use client";

import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="w-full border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Top line: LOGO + inline menu (kept EXACT wording from mockup) */}
        <div className="flex items-center justify-between py-3 text-sm">
          <div className="font-semibold tracking-wide">LOGO</div>
          <nav className="flex gap-4 md:gap-6">
            <Link href="/windows" className="hover:underline">Windows</Link>
            <Link href="/mac" className="hover:underline">Mac</Link>
            <Link href="/ios" className="hover:underline">iOS</Link>
            <Link href="/andriod" className="hover:underline">Andriod</Link>
            <Link href="/games" className="hover:underline">Games</Link>
            <Link href="/pc-games" className="hover:underline">PC Games</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
