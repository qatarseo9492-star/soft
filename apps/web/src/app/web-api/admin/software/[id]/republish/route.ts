// apps/web/src/app/web-api/admin/software/[id]/republish/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    // Touch updatedAt; if not published yet, set publishedAt too
    const current = await db.software.findUnique({
      where: { id: params.id },
      select: { publishedAt: true },
    });

    const data: any = { updatedAt: new Date() };
    if (!current?.publishedAt) data.publishedAt = new Date();

    const software = await db.software.update({
      where: { id: params.id },
      data,
      select: { id: true, slug: true, publishedAt: true, updatedAt: true },
    });

    return NextResponse.json({ ok: true, software });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Republish failed" },
      { status: 500 }
    );
  }
}
