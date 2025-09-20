import { apiGet } from "@/lib/api";

export const dynamic = "force-dynamic";

type Item = { id: string; name: string; slug: string; updatedAt?: string };

export default async function SoftwareListPage() {
  const data = await apiGet<{ ok: boolean; items: Item[] }>("/admin/software").catch(() => ({ ok:false, items: [] as Item[] }));
  const items = data.items || [];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Software</h1>
        <a href="/admin/software/new" className="btn btn-primary">+ New</a>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-left border-b border-[var(--border)]">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2 hidden sm:table-cell">Slug</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-b border-[var(--border)] last:border-0">
                <td className="px-4 py-2">{it.name}</td>
                <td className="px-4 py-2 hidden sm:table-cell opacity-70">{it.slug}</td>
                <td className="px-4 py-2">
                  <a className="text-blue-400 hover:underline" href={`/admin/software/${it.id}`}>Edit</a>
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr><td className="px-4 py-6 opacity-70" colSpan={3}>No items yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
