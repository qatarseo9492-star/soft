export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
// apps/web/src/app/web-api/admin/tools/mirrors/check/route.ts

import { NextResponse } from 'next/server';
import db from '../../../../_lib/db';
import { $Enums } from '@prisma/client';

export async function GET() {
  const items = await db.softwareMedia.findMany({
    where: { type: $Enums.MediaType.GALLERY }, // ✅ enum from $Enums
    select: { id: true, softwareId: true, url: true },
    take: 200,
  });

  return NextResponse.json(
    { ok: true, total: items.length, items },
    { headers: { 'cache-control': 'no-store' } }
  );
}
