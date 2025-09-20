import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseJSON<T = any>(v: unknown, fallback: T): T {
  if (typeof v !== "string") return (v as any) ?? fallback;
  try { return JSON.parse(v as string) as T; } catch { return fallback; }
}
function strOrNull(v: any): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s ? s : null;
}

// PUT /web-api/admin/software/[id]/requirements/[rid]
export async function PUT(req: NextRequest, { params }: { params: { id: string; rid: string } }) {
  const body = await req.json().catch(() => ({}));
  const os = strOrNull(body.os);
  const min = strOrNull(body.min);
  const rec = strOrNull(body.rec);

  const row = await db.software.findUnique({ where: { id: params.id }, select: { systemRequirements: true } });
  if (!row) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  const arr = parseJSON<any[]>(row.systemRequirements, []);

  const idx = arr.findIndex((x) => String(x?.id) === params.rid);
  const i = idx >= 0 ? idx : Number.isFinite(Number(params.rid)) ? Number(params.rid) : -1;
  if (i < 0 || i >= arr.length) {
    return NextResponse.json({ ok: false, error: "Requirement not found" }, { status: 404 });
  }

  const item = { ...arr[i] };
  if (os !== null) item.os = os;
  if (min !== null) item.min = min;
  if (rec !== null) item.rec = rec;
  arr[i] = item;

  await db.software.update({ where: { id: params.id }, data: { systemRequirements: JSON.stringify(arr) } });
  return NextResponse.json({ ok: true });
}

// DELETE /web-api/admin/software/[id]/requirements/[rid]
export async function DELETE(_: NextRequest, { params }: { params: { id: string; rid: string } }) {
  const row = await db.software.findUnique({ where: { id: params.id }, select: { systemRequirements: true } });
  if (!row) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  const arr = parseJSON<any[]>(row.systemRequirements, []);
  const filtered = arr.filter((x, i) => String(x?.id) !== params.rid && String(i) !== params.rid);

  await db.software.update({ where: { id: params.id }, data: { systemRequirements: JSON.stringify(filtered) } });
  return NextResponse.json({ ok: true });
}
