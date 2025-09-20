import db from "@/app/web-api/_lib/db";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://filespay.org";
  const items: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1.0, lastModified: new Date() },
    { url: `${base}/categories`, changeFrequency: "weekly", priority: 0.7, lastModified: new Date() },
  ];

  const cats = await db.category.findMany({ select: { slug: true, updatedAt: true } });
  for (const c of cats) {
    items.push({
      url: `${base}/category/${encodeURIComponent(c.slug)}`,
      changeFrequency: "weekly",
      priority: 0.7,
      lastModified: c.updatedAt ?? new Date(),
    });
  }

  const sw = await db.software.findMany({ select: { slug: true, updatedAt: true, publishedAt: true }, where: { status: "published" } });
  for (const s of sw) {
    items.push({
      url: `${base}/software/${encodeURIComponent(s.slug)}`,
      changeFrequency: "daily",
      priority: 0.9,
      lastModified: s.updatedAt ?? s.publishedAt ?? new Date(),
    });
  }

  return items;
}
