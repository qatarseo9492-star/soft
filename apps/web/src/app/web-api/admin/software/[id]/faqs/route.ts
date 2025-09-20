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

// POST /web-api/admin/software/[id]/faqs
// body: { q: string, a: string, order?: number, id?: string }
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  const q = strOrNull(body.q);
  const a = strOrNull(body.a);
  const order = Number.isFinite(body.order) ? Number(body.order) : 0;
  const fid = strOrNull(body.id) || crypto.randomUUID();

  if (!q || !a) {
    return NextResponse.json({ ok: false, error: "q and a are required" }, { status: 400 });
  }

  const row = await db.software.findUnique({ where: { id: params.id }, select: { faqs: true } });
  if (!row) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  const faqs = parseJSON<any[]>(row.faqs, []);
  faqs.push({ id: fid, q, a, order });

  await db.software.update({
    where: { id: params.id },
    data: { faqs: JSON.stringify(faqs) },
  });

  return NextResponse.json({ ok: true, id: fid });
}
