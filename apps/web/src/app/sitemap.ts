// apps/web/src/app/sitemap.ts
export const revalidate = 3600;

type Software = { slug: string; lastUpdatedAt?: string };

export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://filespay.org";
  const now = new Date().toISOString();

  // Only hit the API at build/export if we have a concrete server URL.
  const api = process.env.API_BASE_SERVER ?? "";

  let items: Software[] = [];
  if (api) {
    try {
      const res = await fetch(`${api}/v1/software?limit=1000`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        items = Array.isArray((data as any).items) ? (data as any).items : [];
      }
    } catch {
      // Ignore network errors — keep sitemap minimal so build doesn't fail.
    }
  }

  return [
    { url: `${base}/`, lastModified: now },
    ...items.map((s) => ({
      url: `${base}/software/${encodeURIComponent(s.slug)}`,
      lastModified: s.lastUpdatedAt ?? now,
    })),
  ];
}
