export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
// apps/web/src/app/web-api/software/import/route.ts

import { NextRequest, NextResponse } from 'next/server';
import db from '../../_lib/db';

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

type Incoming = {
  slug: string;
  name: string;
  shortDesc?: string | null;
  longDesc?: string | null;
  isFree?: boolean;
  categoryId?: string | null;
  websiteUrl?: string | null;
  published?: boolean;
  publishedAt?: string | null;
  version?: string;
  os?: string;
};

export async function POST(req: NextRequest) {
  const input = (await req.json().catch(() => ({}))) as Partial<Incoming>;
  if (!input.slug || !input.name) return bad('slug and name are required');

  const createData: any = {
    slug: input.slug,
    name: input.name,
    shortDesc: input.shortDesc ?? null,
    longDesc: input.longDesc ?? null,
    isFree: !!input.isFree,
    websiteUrl: input.websiteUrl ?? null,
  };
  if (typeof input.categoryId === 'string' && input.categoryId) {
    createData.categoryId = input.categoryId;
  }
  if (typeof input.published === 'boolean') {
    createData.publishedAt = input.published ? new Date() : null;
  } else if (typeof input.publishedAt === 'string') {
    createData.publishedAt = new Date(input.publishedAt);
  }

  const created = await db.software.upsert({
    where: { slug: input.slug },
    create: createData,
    update: createData,
    select: { id: true, slug: true },
  });

  if (input.version?.trim()) {
    // create a first version; os required by your schema
    await db.softwareVersion.create({
      data: {
        softwareId: created.id,
        version: input.version.trim(),
        os: input.os || 'unknown',
      },
    });
  }

  return NextResponse.json(
    { ok: true, softwareId: created.id, slug: created.slug },
    { status: 201, headers: { 'cache-control': 'no-store' } }
  );
}
