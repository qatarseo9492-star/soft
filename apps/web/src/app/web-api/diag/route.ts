import { NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const ver = await db.$queryRaw<Array<{ v: string }>>`SELECT VERSION() as v`;
    const softwareCount = await db.software.count();
    return NextResponse.json({ ok: true, dbVersion: ver?.[0]?.v, softwareCount });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}
