// src/app/web-api/admin/stats/top/route.ts
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import db from "../../../_lib/db";

const subDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const period = (searchParams.get("period") || "day").toLowerCase(); // day|week|month
  const limit = Math.min(Math.max(Number(searchParams.get("limit") || 10), 1), 50);

  const since =
    period === "week" ? subDays(7) : period === "month" ? subDays(30) : subDays(1);

  // No orderBy/take in groupBy (type-safe) — we sort + slice in JS.
  const grouped = await db.downloadLog.groupBy({
    by: ["softwareId"],
    where: { createdAt: { gte: since } },
    _count: { _all: true },
  });

  const sorted = grouped
    .map((g) => ({ softwareId: g.softwareId!, count: (g as any)._count?._all ?? 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  const ids = sorted.map((g) => g.softwareId);
  const softwares = await db.software.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      name: true,
      slug: true,
      iconUrl: true,
      shortDesc: true,
      categories: { select: { category: { select: { id: true, name: true, slug: true } } } },
    },
  });

  const byId = new Map(softwares.map((s) => [s.id, s]));
  const items = sorted.map((g) => ({
    softwareId: g.softwareId,
    count: g.count,
    software: byId.get(g.softwareId) ?? null,
  }));

  return NextResponse.json({ ok: true, items, period, since });
}
