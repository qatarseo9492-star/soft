// src/app/web-api/admin/stats/counts/route.ts
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import db from "../../../_lib/db";

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
const subDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

export async function GET() {
  const since1 = startOfDay();
  const since7 = subDays(7);
  const since30 = subDays(30);

  const [d1, d7, d30] = await Promise.all([
    db.downloadLog.count({ where: { createdAt: { gte: since1 } } }),
    db.downloadLog.count({ where: { createdAt: { gte: since7 } } }),
    db.downloadLog.count({ where: { createdAt: { gte: since30 } } }),
  ]);

  return NextResponse.json({ ok: true, downloads: { day: d1, week: d7, month: d30 } });
}
