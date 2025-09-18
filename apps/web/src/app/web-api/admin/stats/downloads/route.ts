export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
// src/app/web-api/admin/stats/downloads/route.ts
import { NextResponse } from "next/server";

// Stub that always responds; replace with real aggregation from your analytics table.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const days = Number(url.searchParams.get("days") || 7);
  return NextResponse.json({
    ok: true,
    range: `${days}d`,
    today: 0,
    last7d: 0,
    total: 0,
  });
}
