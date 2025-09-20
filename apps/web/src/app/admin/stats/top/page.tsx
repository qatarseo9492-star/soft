// src/app/admin/stats/top/page.tsx
export const dynamic = "force-dynamic";

type TopItem = {
  softwareId: string;
  count: number;
  software?: { id: string; name: string; slug: string } | null;
};

type TopResp = { ok: boolean; items: TopItem[]; error?: string };

async function getTop(): Promise<TopResp> {
  const base = process.env.NEXT_PUBLIC_API_BASE || "";
  const res = await fetch(`${base}/web-api/admin/stats/top`, {
    // FIX: use only one caching model
    cache: "no-store",
  });
  if (!res.ok) {
    return { ok: false, items: [], error: `HTTP ${res.status}` };
  }
  return res.json();
}

export default async function AdminTopPage() {
  const data = await getTop();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-semibold">Top Downloads (Admin)</h1>

      {!data.ok ? (
        <p className="text-sm text-red-500">Failed to load: {data.error ?? "unknown error"}</p>
      ) : data.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No data yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Software</th>
                <th className="px-3 py-2">Slug</th>
                <th className="px-3 py-2">Downloads</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((it, idx) => (
                <tr key={it.softwareId} className="border-t">
                  <td className="px-3 py-2 tabular-nums">{idx + 1}</td>
                  <td className="px-3 py-2">{it.software?.name ?? "—"}</td>
                  <td className="px-3 py-2 text-muted-foreground">{it.software?.slug ?? "—"}</td>
                  <td className="px-3 py-2 font-medium tabular-nums">{it.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
