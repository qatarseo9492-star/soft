// src/app/web-api/stats/top/route.ts
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { topByPeriod } from "../../_lib/software-store";

// Accept day|week|month and normalize to daily|weekly|monthly
const normalize = (p: string): "daily" | "weekly" | "monthly" => {
  const x = p.toLowerCase();
  if (x === "day" || x === "daily") return "daily";
  if (x === "week" || x === "weekly") return "weekly";
  return "monthly";
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const period = normalize(searchParams.get("period") || "day");
  const limit = Math.min(Math.max(Number(searchParams.get("limit") || 10), 1), 50);

  const rows = await topByPeriod(period, limit);
  return NextResponse.json({ ok: true, period, items: rows });
}
