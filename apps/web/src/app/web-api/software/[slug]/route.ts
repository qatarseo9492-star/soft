export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
import { NextRequest, NextResponse } from "next/server";


export async function GET(_req: NextRequest, ctx: { params: { slug: string } }) {
  const apiBase = process.env.API_BASE_SERVER;
  if (!apiBase) return NextResponse.json({ ok: false, error: "API_BASE_SERVER missing" }, { status: 500 });

  const url = `${apiBase}/v1/software/${encodeURIComponent(ctx.params.slug)}`;
  try {
    const upstream = await fetch(url, { cache: "no-store" });
    const body = await upstream.json().catch(() => ({}));
    return NextResponse.json(body, { status: upstream.status });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Upstream error" }, { status: 502 });
  }
}
