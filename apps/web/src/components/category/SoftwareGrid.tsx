// apps/web/src/components/category/SoftwareGrid.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type SoftwareItem = {
  id: string;
  name: string;
  slug: string;
  os: string[];
  license: string | null;
  ratingAvg: number | null;
  downloads?: number | null;
  sizeBytes?: number | null;
  updatedAt: string;
  vendor?: { name: string } | null;
  latestVersion?: { number: string | null } | null;
};

export function SoftwareGrid({ items, total, page, perPage }: { items: SoftwareItem[]; total: number; page: number; perPage: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  function goto(p: number) {
    const params = new URLSearchParams(sp ? sp.toString() : "");
    params.set("page", String(p));
    router.push(`${pathname}?${params.toString()}`);
  }

  if (!items.length) {
    return (
      <div className="rounded-2xl border p-10 text-center text-muted-foreground">No results match your filters.</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <Card key={it.id} className="group overflow-hidden rounded-2xl border p-0">
            <CardHeader className="p-4">
              <CardTitle className="line-clamp-2 text-base">
                <Link href={`/software/${it.slug}`} className="hover:underline">{it.name}</Link>
              </CardTitle>
              <div className="mt-1 text-xs text-muted-foreground">{it.vendor?.name ?? "—"}</div>
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-0">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full border px-2 py-0.5">{it.license ?? "—"}</span>
                {it.os?.map((o) => (
                  <span key={o} className="rounded-full border px-2 py-0.5 capitalize">{o}</span>
                ))}
                {it.latestVersion?.number ? (
                  <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">
                    v{it.latestVersion.number}
                  </span>
                ) : null}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Updated {new Date(it.updatedAt).toLocaleDateString()}</span>
                <span className="tabular-nums">{(it.sizeBytes ?? 0) > 0 ? `${Math.round((it.sizeBytes ?? 0) / (1024*1024))} MB` : "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">⭐ {(it.ratingAvg ?? 0).toFixed(1)}</div>
                <Button asChild size="sm">
                  <Link href={`/download/${it.slug}`}>Download</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="sm" onClick={() => goto(Math.max(1, page - 1))} disabled={page <= 1}>
          Prev
        </Button>
        <div className="text-sm tabular-nums">Page {page} / {totalPages}</div>
        <Button variant="outline" size="sm" onClick={() => goto(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>
          Next
        </Button>
      </div>
    </div>
  );
}
