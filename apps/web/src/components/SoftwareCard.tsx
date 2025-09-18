// apps/web/src/components/SoftwareCard.tsx
"use client";

import Link from "next/link";

type SoftwareLite = {
  id: string;
  slug: string;
  name: string;
  iconUrl?: string | null;
};

export default function SoftwareCard({ s }: { s: SoftwareLite }) {
  // Use UrlObject to satisfy Next's typed Link
  const href = { pathname: `/${s.slug}` };

  return (
    <div className="rounded-xl border border-foreground/10 p-4 hover:border-foreground/20 transition-colors">
      <div className="flex items-center gap-3">
        {s.iconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.iconUrl} alt="" className="h-8 w-8 rounded-md object-cover" />
        ) : (
          <div className="h-8 w-8 rounded-md bg-foreground/10" />
        )}
        <Link href={href} className="font-semibold hover:underline truncate">
          {s.name}
        </Link>
      </div>
    </div>
  );
}
