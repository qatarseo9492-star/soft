import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const target = searchParams.get("url");
  if (!target) {
    return NextResponse.json({ ok: false, error: "Missing ?url=" }, { status: 400 });
  }
  try {
    const r = await fetch(target, {
      cache: "no-store",
      // add headers if your origin requires them
      headers: { "user-agent": "FilespayProxy/1.0 (+https://filespay.org)" },
    });

    const body = await r.arrayBuffer();
    const headers = new Headers();
    headers.set("content-type", r.headers.get("content-type") || "application/octet-stream");

    return new NextResponse(body, { status: r.status, headers });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Fetch failed" }, { status: 502 });
  }
}
