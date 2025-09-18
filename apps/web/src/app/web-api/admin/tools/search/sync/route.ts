export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
// apps/web/src/app/web-api/admin/tools/search/sync/route.ts

import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../_lib/db';

export async function POST() {
  // Pull only published software (publishedAt not null)
  const list = await db.software.findMany({
    where: { NOT: { publishedAt: null } },
    select: {
      id: true,
      slug: true,
      name: true,
      shortDesc: true,
      categoryId: true,
      publishedAt: true,
      _count: { select: { versions: true } },
      versions: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { id: true, version: true, createdAt: true },
      },
    },
    take: 1000,
  });

  const docs = list.map((s) => {
    const latest = s.versions[0] || null;
    return {
      id: s.id,
      slug: s.slug,
      name: s.name,
      shortDesc: s.shortDesc ?? '',
      categoryId: s.categoryId,
      publishedAt: s.publishedAt,
      versionsCount: s._count.versions,
      latestVersion: latest ? { id: latest.id, version: latest.version, createdAt: latest.createdAt } : null,
    };
  });

  // Your Meilisearch sync would go here.
  return NextResponse.json({ ok: true, count: docs.length, docs }, { headers: { 'cache-control': 'no-store' } });
}
