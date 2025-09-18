export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
// apps/web/src/app/web-api/admin/software/[id]/versions/route.ts

import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../_lib/db';

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const softwareId = params.id;

  const versions = await db.softwareVersion.findMany({
    where: { softwareId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      version: true,
      createdAt: true,
      _count: { select: { builds: true } },
    },
  });

  return NextResponse.json(
    { ok: true, items: versions, nextCursor: null },
    { headers: { 'cache-control': 'no-store' } }
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const softwareId = params.id;
  const { version, os } = (await req.json().catch(() => ({}))) as {
    version?: string;
    os?: string;
  };

  if (!version?.trim()) return bad('Version is required');

  const item = await db.softwareVersion.create({
    data: { softwareId, version: version.trim(), os: os || 'unknown' }, // ✅ include os
    select: { id: true, version: true, createdAt: true },
  });

  return NextResponse.json(
    { ok: true, item },
    { status: 201, headers: { 'cache-control': 'no-store' } }
  );
}
