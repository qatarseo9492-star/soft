export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // stubbed empty list
  return NextResponse.json({ ok: true, total: 0, items: [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { ip, reason } = body || {};
  if (!ip) return NextResponse.json({ ok: false, error: "IP is required" }, { status: 400 });

  // pretend it was created successfully
  return NextResponse.json(
    {
      ok: true,
      item: {
        id: crypto.randomUUID(),
        ip: String(ip),
        reason: reason ? String(reason) : null,
        createdAt: new Date().toISOString(),
      },
    },
    { status: 201 }
  );
}
