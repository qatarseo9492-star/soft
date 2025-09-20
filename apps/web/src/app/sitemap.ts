// DB-FREE, BUILD-SAFE SITEMAP
import type { MetadataRoute } from "next";

const BASE =
  (process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"))
    .replace(/\/$/, "");

export const runtime = "nodejs"; // fine for sitemap
export const dynamic = "force-static"; // allow prerender, but don't error if fetch fails

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // always include a few static routes
  const baseRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: new Date() },
    { url: `${BASE}/software`, lastModified: new Date() },
  ];

  // try to get slugs from the public API; if it fails, just return baseRoutes
  try {
    const res = await fetch(`${BASE}/web-api/software?limit=1000`, {
      // if this 404s or is unavailable at build time, we’ll catch and return baseRoutes
      next: { revalidate: 3600 },
    });
    if (!res.ok) return baseRoutes;

    const data = (await res.json()) as { items?: Array<{ slug: string; updatedAt?: string }> };
    const items = Array.isArray(data.items) ? data.items : [];

    const dyn: MetadataRoute.Sitemap = items.map((s) => ({
      url: `${BASE}/software/${s.slug}`,
      lastModified: s.updatedAt ? new Date(s.updatedAt) : new Date(),
    }));

    return [...baseRoutes, ...dyn];
  } catch {
    return baseRoutes;
  }
}
