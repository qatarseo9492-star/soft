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

// PUT /web-api/admin/software/[id]/faqs/[fid]
export async function PUT(req: NextRequest, { params }: { params: { id: string; fid: string } }) {
  const body = await req.json().catch(() => ({}));
  const q = strOrNull(body.q);
  const a = strOrNull(body.a);
  const order = Number.isFinite(body.order) ? Number(body.order) : undefined;

  const row = await db.software.findUnique({ where: { id: params.id }, select: { faqs: true } });
  if (!row) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  const arr = parseJSON<any[]>(row.faqs, []);

  // Find by id; fall back to numeric index
  const idx = arr.findIndex((x) => String(x?.id) === params.fid);
  const i = idx >= 0 ? idx : Number.isFinite(Number(params.fid)) ? Number(params.fid) : -1;
  if (i < 0 || i >= arr.length) {
    return NextResponse.json({ ok: false, error: "FAQ not found" }, { status: 404 });
  }

  const item = { ...arr[i] };
  if (q !== null) item.q = q;
  if (a !== null) item.a = a;
  if (order !== undefined) item.order = order;
  arr[i] = item;

  await db.software.update({ where: { id: params.id }, data: { faqs: JSON.stringify(arr) } });
  return NextResponse.json({ ok: true });
}

// DELETE /web-api/admin/software/[id]/faqs/[fid]
export async function DELETE(_: NextRequest, { params }: { params: { id: string; fid: string } }) {
  const row = await db.software.findUnique({ where: { id: params.id }, select: { faqs: true } });
  if (!row) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  const arr = parseJSON<any[]>(row.faqs, []);
  const filtered = arr.filter((x, i) => String(x?.id) !== params.fid && String(i) !== params.fid);

  await db.software.update({ where: { id: params.id }, data: { faqs: JSON.stringify(filtered) } });
  return NextResponse.json({ ok: true });
}
