export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
import { NextRequest, NextResponse } from "next/server";
import db from "../_lib/db";


export async function GET(req: NextRequest) {
  try {
    const url   = new URL(req.nextUrl);
    const limit = Math.min(Number(url.searchParams.get("limit") || 20), 100);
    const skip  = Math.max(Number(url.searchParams.get("skip") || 0), 0);

    const items = await db.software.findMany({
      where: undefined,
      take: limit,
      skip,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        shortDesc: true,
        publishedAt: true,
        updatedAt: true,
        _count: { select: { versions: true } },
      },
    });

    const mapped = items.map(s => ({ ...s, published: !!s.publishedAt }));
    return NextResponse.json({ ok: true, total: mapped.length, items: mapped });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
