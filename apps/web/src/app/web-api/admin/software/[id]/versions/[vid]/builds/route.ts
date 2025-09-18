export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
// apps/web/src/app/web-api/admin/software/[id]/versions/[vid]/builds/route.ts

import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../../../_lib/db'; // ✅ 6 levels up

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string; vid: string } }
) {
  const versionId = params.vid;

  const v = await db.softwareVersion.findUnique({
    where: { id: versionId },
    select: { id: true },
  });
  if (!v) return bad('Version not found', 404);

  const items = await db.softwareBuild.findMany({
    where: { versionId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, versionId: true, createdAt: true },
  });

  const total = await db.softwareBuild.count({ where: { versionId } });

  return NextResponse.json(
    { ok: true, items, total, nextCursor: null },
    { headers: { 'cache-control': 'no-store' } }
  );
}

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error:
        'Build creation not configured for current schema. Tell me required SoftwareBuild fields and I’ll wire it up.',
    },
    { status: 501 }
  );
}
