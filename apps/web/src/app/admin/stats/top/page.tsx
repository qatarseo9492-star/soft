// apps/web/src/app/admin/stats/top/page.tsx
import { apiGet } from "@/lib/api";


/** Server Component page (no "use client") */
export default async function TopDownloadsPage() {
  const data = await apiGet<{ ok: boolean; items: Array<{
    softwareId: string;
    count: number;
    software: { id: string; name: string; slug: string; category?: { id: string; name: string; slug: string } } | null;
  }> }>("/admin/stats/top?days=7&limit=10");

  const items = data.ok ? data.items : [];

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Top Downloads (7 days)</h1>
      <div className="overflow-x-auto">
        <table className="min-w-[600px] border">
          <thead>
            <tr className="bg-neutral-100">
              <th className="text-left p-2 border">#</th>
              <th className="text-left p-2 border">Software</th>
              <th className="text-left p-2 border">Category</th>
              <th className="text-right p-2 border">Downloads</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row, i) => (
              <tr key={row.softwareId}>
                <td className="p-2 border">{i + 1}</td>
                <td className="p-2 border">{row.software?.name ?? "Unknown"}</td>
                <td className="p-2 border">{row.software?.category?.name ?? "-"}</td>
                <td className="p-2 border text-right">{row.count}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={4} className="p-4 text-center text-neutral-500">No data</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
