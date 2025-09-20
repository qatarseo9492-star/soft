// src/app/web-api/admin/tools/search/sync/route.ts
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import db from "@/lib/db"; // ⬅️ use path alias so TS can resolve it

export async function POST() {
  // Pull minimal fields for indexing
  const rows = await db.software.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      shortDesc: true,
      longDesc: true,
      updatedAt: true,
      categories: { select: { category: { select: { id: true, name: true, slug: true } } } },
      _count: { select: { versions: true } },
      versions: {
        orderBy: { releasedAt: "desc" },
        take: 1,
        select: { id: true, version: true, releasedAt: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const docs = rows.map((s) => {
    const latest = s.versions[0] || null;
    const primaryCat = s.categories[0]?.category || null;
    return {
      id: s.id,
      slug: s.slug,
      name: s.name,
      shortDesc: s.shortDesc,
      longDesc: s.longDesc,
      updatedAt: s.updatedAt,
      category: primaryCat,
      versionsCount: s._count.versions,
      latestVersion: latest?.version || null,
      latestReleasedAt: latest?.releasedAt || null,
    };
  });

  // TODO: push `docs` to Meilisearch if enabled
  return NextResponse.json({ ok: true, indexed: docs.length });
}
