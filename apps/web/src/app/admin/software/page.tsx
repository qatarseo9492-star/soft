export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
// apps/web/src/app/admin/software/page.tsx

type ApiListResponse<T> = { ok: boolean; items: T[]; total?: number };
type SoftwareRow = {
  id: string;
  name: string;
  slug: string;
  shortDesc?: string | null;
  updatedAt?: string;
  publishedAt?: string | null;
  category?: { name?: string | null } | null;
  vendor?: { name?: string | null } | null;
};

async function getData(): Promise<SoftwareRow[]> {
  try {
    const res = await fetch(process.env.NEXT_PUBLIC_SITE_URL + '/web-api/software?limit=50', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json: ApiListResponse<SoftwareRow> = await res.json();
    if (!json?.ok || !Array.isArray(json.items)) return [];
    return json.items;
  } catch {
    return [];
  }
}

export default async function AdminSoftwarePage() {
  const items = await getData();

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold mb-4">Software</h1>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2 pr-3">Name</th>
            <th className="py-2 pr-3">Category</th>
            <th className="py-2 pr-3">Vendor</th>
            <th className="py-2 pr-3">Updated</th>
            <th className="py-2 pr-3">Published</th>
          </tr>
        </thead>
        <tbody>
          {items.map((s) => (
            <tr key={s.id} className="border-b">
              <td className="py-2 pr-3">{s.name}</td>
              <td className="py-2 pr-3">{s.category?.name ?? '-'}</td>
              <td className="py-2 pr-3">{s.vendor?.name ?? '-'}</td>
              <td className="py-2 pr-3">
                {s.updatedAt ? new Date(s.updatedAt).toLocaleDateString() : '-'}
              </td>
              <td className="py-2 pr-3">
                {s.publishedAt ? new Date(s.publishedAt).toLocaleDateString() : '-'}
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td className="py-6 text-neutral-500" colSpan={5}>
                No items yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
