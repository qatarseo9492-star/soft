import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const slug = params.slug;
  const id = req.nextUrl.searchParams.get("id");

  // 1) fetch detail via proxy
  const r = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || "/web-api"}/software/${encodeURIComponent(slug)}`, { cache: "no-store" });
  if (!r.ok) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  const json = await r.json();
  const data = json.data ?? json.software ?? json;

  // 2) pick best URL
  const versions = data?.software?.versions ?? data?.versions ?? [];
  const allBuilds = versions.flatMap((v: any) => v.builds ?? []);
  const wanted = id ? allBuilds.find((b: any) => b.id === id) : allBuilds[0];
  const url = wanted?.downloadUrl ?? null;
  const buildId = wanted?.id ?? null;
  if (!url) return NextResponse.json({ ok: false, error: "No downloadable build" }, { status: 404 });

  // 3) fire-and-forget log to API direct (faster than double-proxy)
  const api = process.env.API_BASE_SERVER;
  if (api) {
    fetch(`${api}/v1/software/${encodeURIComponent(slug)}/downloads`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ buildId }),
      keepalive: true,
    }).catch(() => {});
  }

  return NextResponse.redirect(url, 307);
}
