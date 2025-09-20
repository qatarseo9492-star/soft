// src/app/web-api/admin/categories/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const items = await db.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  }).catch(() => []);
  return NextResponse.json({ ok: true, items });
}
