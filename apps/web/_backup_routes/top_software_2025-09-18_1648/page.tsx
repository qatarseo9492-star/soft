// apps/web/src/app/software/[slug]/page.tsx
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";

export const dynamic = "force-dynamic";

async function getDetail(slug: string) {
  const base = process.env.NEXT_PUBLIC_API_BASE || "/web-api";
  const r = await fetch(`${base}/software/${encodeURIComponent(slug)}`, { cache: "no-store" });
  if (!r.ok) return null;
  const j = await r.json();
  return j?.software ?? j?.data?.software ?? j?.data ?? j;
}

export default async function SoftwarePage({ params }: { params: { slug: string } }) {
  const s = await getDetail(params.slug);
  if (!s) return <main className="px-6 py-16"><h1 className="text-2xl font-semibold">Not found</h1></main>;

  // JSON-LD objects
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://filespay.org";
  const ldSoftware = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: s.name,
    operatingSystem: (s.os ?? []).join(", "),
    applicationCategory: (s.categories ?? [])[0] || "Software",
    applicationSubCategory: (s.categories ?? []).slice(1).join(", ") || undefined,
    softwareVersion: s.latestVersion || undefined,
    downloadUrl: `${siteUrl}/download/${s.slug}`,
    offers: s.license
      ? { "@type": "Offer", price: "0", priceCurrency: "USD", category: s.license }
      : undefined,
  };

  const ldBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Software", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 3, name: s.name, item: `${siteUrl}/software/${s.slug}` },
    ],
  };

  return (
    <main className="px-5 md:px-8 lg:px-12 py-8">
      {/* JSON-LD injections */}
      <JsonLd data={ldSoftware} />
      <JsonLd data={ldBreadcrumb} />

      <section className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">{s.name}</h1>
            <div className="mt-1 text-sm text-gray-500">
              {s.vendor?.name ?? "—"} {s.latestVersion ? `• v${s.latestVersion}` : ""} {s.license ? `• ${s.license}` : ""}
            </div>
            <p className="mt-4 text-gray-700 max-w-3xl">{s.description ?? "Description coming soon."}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {(s.os ?? []).map((os: string) => <span key={os} className="text-[11px] px-2 py-1 rounded-full bg-gray-100">{os}</span>)}
              {(s.categories ?? []).slice(0,3).map((c: string) => <span key={c} className="text-[11px] px-2 py-1 rounded-full bg-gray-100">{c}</span>)}
            </div>
            <div className="mt-6 flex items-center gap-3">
              <Link href={`/download/${s.slug}`} className="px-4 py-2 rounded-xl border border-gray-300 bg-gray-50 hover:bg-gray-100 text-sm font-medium">Download</Link>
              {s.homepage && <a href={s.homepage} target="_blank" className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm">Homepage</a>}
            </div>
          </div>
          <div className="text-right text-xs text-gray-500">
            {s.updatedAt ? `Updated: ${new Date(s.updatedAt).toLocaleDateString()}` : ""}
          </div>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Builds</h2>
          <div className="mt-4 divide-y">
            {(s.versions ?? []).flatMap((v: any) => (v.builds ?? []).map((b: any) => (
              <div key={b.id} className="py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-medium">v{v.version} {b.os ? `• ${b.os}` : ""} {b.arch ? `(${b.arch})` : ""}</div>
                  <div className="text-xs text-gray-500">
                    {v.releasedAt ? `Released ${new Date(v.releasedAt).toLocaleDateString()}` : ""}
                    {b.sizeMB ? ` • ${b.sizeMB.toFixed(0)} MB` : ""}
                    {b.sha256 ? ` • SHA256: ${b.sha256.slice(0, 10)}…` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/download/${s.slug}?id=${encodeURIComponent(b.id)}`} className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100">
                    Download
                  </Link>
                  {b.downloadUrl && <a href={b.downloadUrl} className="text-xs underline text-gray-500">direct</a>}
                </div>
              </div>
            )))}
            {(!s.versions || s.versions.length === 0) && <div className="text-sm text-gray-500 py-6">No builds listed yet.</div>}
          </div>
        </div>

        <aside className="rounded-2xl border border-gray-200 bg-white p-6">
          <h3 className="text-base font-semibold">Info</h3>
          <ul className="mt-3 text-sm text-gray-700 space-y-2">
            <li><span className="text-gray-500">License:</span> {s.license ?? "—"}</li>
            <li><span className="text-gray-500">Vendor:</span> {s.vendor?.name ?? "—"}</li>
            <li><span className="text-gray-500">Platforms:</span> {(s.os ?? []).join(", ") || "—"}</li>
          </ul>
        </aside>
      </section>
    </main>
  );
}
