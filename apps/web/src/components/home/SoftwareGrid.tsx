import Link from "next/link";

type Item = {
  id: string; slug: string; name: string;
  vendor?: { name?: string | null } | null;
  version?: string | null;
  os?: string[]; license?: string | null;
  updatedAt?: string | null; heroImage?: string | null;
};

export default function SoftwareGrid({ items }: { items: Item[] }) {
  if (!items?.length) {
    return <div className="text-sm text-gray-500 py-16 text-center">No results yet.</div>;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
      {items.map((it) => (
        <article key={it.id} className="group rounded-2xl border border-gray-200 bg-white hover:shadow-xl transition-shadow">
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Link href={`/software/${it.slug}`} className="text-lg font-semibold hover:underline">
                  {it.name}
                </Link>
                <div className="text-xs text-gray-500 mt-0.5">
                  {it.vendor?.name ?? "—"} {it.version ? `• v${it.version}` : ""}
                </div>
              </div>
              <div className="text-[11px] leading-4 text-right text-gray-500">
                {it.updatedAt ? new Date(it.updatedAt).toLocaleDateString() : ""}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-4">
              {(it.os ?? []).slice(0, 3).map((os) => (
                <span key={os} className="text-[11px] px-2 py-1 rounded-full bg-gray-100">{os}</span>
              ))}
              {it.license && <span className="text-[11px] px-2 py-1 rounded-full bg-gray-100">{it.license}</span>}
            </div>

            <div className="mt-5 flex items-center justify-between">
              <Link href={`/software/${it.slug}`} className="text-sm font-medium underline">Details</Link>
              <Link href={`/download/${it.slug}`} className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100">
                Download
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
