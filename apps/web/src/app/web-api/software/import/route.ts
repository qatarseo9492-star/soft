// src/app/web-api/software/import/route.ts
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import db from "../../_lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { name, slug, shortDesc, longDesc, homepage } = body || {};
  if (!name || !slug) return NextResponse.json({ ok: false, error: "name, slug required" }, { status: 400 });

  const created = await db.software.create({
    data: {
      name,
      slug,
      shortDesc: shortDesc ?? null,
      longDesc: longDesc ?? null,
      homepage: homepage ?? null,
      publishedAt: new Date(),
    },
    select: { id: true, name: true, slug: true },
  });

  // optional: seed a first version if provided
  if (body?.version) {
    await db.version.create({
      data: {
        softwareId: created.id,
        version: String(body.version),
        releasedAt: body.releasedAt ? new Date(body.releasedAt) : null,
      },
    });
  }

  return NextResponse.json({ ok: true, software: created }, { status: 201 });
}
