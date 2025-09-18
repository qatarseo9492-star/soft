export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
// apps/web/src/app/web-api/admin/stats/top/route.ts
import { NextResponse, NextRequest } from "next/server";
import db from "../../../_lib/db";

// Ensure Prisma runs in Node runtime and the route is always dynamic

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams; // ✅ don't use req.url
    const days = Number(sp.get("days") ?? "7");
    const limit = Math.min(Number(sp.get("limit") ?? "10"), 50);

    const since = new Date(Date.now() - days * 864e5);

    // group downloads by software in the date window
    const grouped = await db.downloadEvent.groupBy({
      by: ["softwareId"],
      where: { createdAt: { gte: since } },
      _count: { softwareId: true },
      orderBy: { _count: { softwareId: "desc" } },
      take: limit,
    });

    const ids = grouped.map(g => g.softwareId);
    const softwares = await db.software.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        name: true,
        slug: true,
        category: { select: { id: true, name: true, slug: true } },
      },
    });
    const byId = new Map(softwares.map(s => [s.id, s]));

    const items = grouped.map(g => ({
      softwareId: g.softwareId,
      count: g._count.softwareId,
      software: byId.get(g.softwareId) ?? null,
    }));

    return NextResponse.json({ ok: true, items });
  } catch (err) {
    console.error("admin/stats/top error:", err);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}
