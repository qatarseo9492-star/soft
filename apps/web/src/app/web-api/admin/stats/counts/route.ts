export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
// src/app/web-api/admin/stats/counts/route.ts
import { NextResponse } from "next/server";
import db from "../../../_lib/db";


export async function GET() {
  try {
    const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalSoftware,
      publishedSoftware,
      vendors,
      downloads7d,
      commentsPending,
      reviews,
    ] = await Promise.all([
      db.software.count(),
      db.software.count({ where: { publishedAt: { not: null } } }),
      db.vendor.count(),
      db.downloadEvent.count({ where: { createdAt: { gte: since7 } } }),
      db.comment.count({ where: { status: "PENDING" } }),
      db.review.count(),
    ]);

    return NextResponse.json({
      ok: true,
      counts: {
        totalSoftware,
        publishedSoftware,
        vendors,
        downloads7d,
        commentsPending,
        reviews,
      },
    });
  } catch (err: any) {
    console.error("[admin/stats/counts] error", err);
    return NextResponse.json(
      { ok: false, error: "counts-failed" },
      { status: 500 }
    );
  }
}
