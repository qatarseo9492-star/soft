export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
// apps/web/src/app/web-api/admin/tools/meta-jsonld/route.ts

import { NextRequest, NextResponse } from 'next/server';
import db from '../../../_lib/db'; // ✅ 3 levels up

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const softwareId = searchParams.get('softwareId');
  const versionId = searchParams.get('versionId');

  if (!softwareId && !versionId) return bad('softwareId or versionId required');

  const software = await db.software.findUnique({
    where: softwareId ? { id: softwareId } : { id: 'NOPE' },
    select: {
      id: true,
      slug: true,
      name: true,
      shortDesc: true,
      websiteUrl: true,
      publishedAt: true,
    },
  });

  let version: { id: string; version: string } | null = null;
  if (versionId) {
    version = await db.softwareVersion.findUnique({
      where: { id: versionId },
      select: { id: true, version: true },
    });
  }

  if (!software) return bad('Software not found', 404);

  const jsonld: any = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: software.name,
    url: software.websiteUrl || `https://filespay.org/s/${software.slug}`,
    applicationCategory: 'SoftwareApplication',
    description: software.shortDesc ?? undefined,
  };

  if (version) jsonld.softwareVersion = version.version;

  return NextResponse.json(
    { ok: true, jsonld },
    { headers: { 'cache-control': 'no-store' } }
  );
}
