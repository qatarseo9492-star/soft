export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
// src/app/web-api/admin/software/[id]/republish/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    await db.software.update({
      where: { id: params.id },
      data: { updatedAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Republish failed" }, { status: 500 });
  }
}
