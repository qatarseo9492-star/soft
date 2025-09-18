import { absUrl } from "@/app/_lib/base-url";
export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
// apps/web/src/app/admin/page.tsx

import Link from "next/link";


// ---------- Types ----------
type CountsResp = {
  ok: boolean;
  counts?: {
    totalSoftware: number;
    publishedSoftware: number;
    vendors: number;
    downloads7d: number;
    commentsPending: number;
    reviews: number;
  };
  error?: string;
};

type TopItem = {
  softwareId: string;
  count: number;
  software?: { id: string; name: string; slug: string } | null;
};

type TopResp = { ok: boolean; items: TopItem[]; error?: string };

// ---------- Helpers ----------
async function getJSON<T>(path: string): Promise<T | null> {
  try {
    // Relative URL ensures we hit this same Next server (works behind any proxy)
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// ---------- Page ----------
export default async function AdminHome() {
  // Call our local API routes
  const [countsRes, topRes] = await Promise.all([
    getJSON<CountsResp>(process.env.NEXT_PUBLIC_SITE_URL + "/web-api/admin/stats/counts"),
    getJSON<TopResp>(absUrl("/web-api/admin/stats/top?days=7&limit=10")),
  ]);

  const counts =
    countsRes?.ok && countsRes.counts
      ? countsRes.counts
      : {
          totalSoftware: 0,
          publishedSoftware: 0,
          vendors: 0,
          downloads7d: 0,
          commentsPending: 0,
          reviews: 0,
        };

  const top = topRes?.ok ? topRes.items : [];

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Admin dashboard</h1>

      {/* Stat cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total software" value={counts.totalSoftware} />
        <StatCard title="Published" value={counts.publishedSoftware} />
        <StatCard title="Vendors" value={counts.vendors} />
        <StatCard title="Downloads (7d)" value={counts.downloads7d} />
        <StatCard title="Pending comments" value={counts.commentsPending} />
        <StatCard title="Reviews" value={counts.reviews} />
      </div>

      {/* Top downloads table */}
      <div className="border rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium">Top downloads (7 days)</h2>
          <Link className="text-sm underline" href="/admin/stats/downloads">
            See all
          </Link>
        </div>

        {top.length === 0 ? (
          <div className="text-sm text-neutral-500">No downloads yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[520px] w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">Software</th>
                  <th className="py-2">Downloads</th>
                </tr>
              </thead>
              <tbody>
                {top.map((row) => (
                  <tr key={row.softwareId} className="border-b last:border-none">
                    <td className="py-2 pr-4">
                      {row.software ? (
                        <Link
                          href={`/admin/software?slug=${encodeURIComponent(
                            row.software.slug
                          )}`}
                          className="underline"
                        >
                          {row.software.name}
                        </Link>
                      ) : (
                        <span className="text-neutral-500">Unknown</span>
                      )}
                    </td>
                    <td className="py-2 tabular-nums">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- UI ----------
function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="border rounded-2xl p-4">
      <div className="text-sm text-neutral-500">{title}</div>
      <div className="text-2xl font-semibold mt-1 tabular-nums">{value}</div>
    </div>
  );
}
