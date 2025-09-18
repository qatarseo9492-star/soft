export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
// src/app/web-api/search/route.ts
import { NextResponse } from "next/server";


const HOST = process.env.MEILI_HOST;
const KEY  = process.env.MEILI_KEY;
const INDEX = process.env.MEILI_INDEX || "software";

type Hit = {
  id: string;
  slug: string;
  name: string;
  shortDesc?: string | null;
  category?: string | null;
  updatedAt?: string | null;
  versionsCount?: number | null;
};

export async function GET(req: Request) {
  try {
    if (!HOST || !KEY) {
      return NextResponse.json({ ok: false, error: "MEILI_HOST/MEILI_KEY not set" }, { status: 500 });
    }

    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    const limit  = Math.min(parseInt(url.searchParams.get("limit") || "10", 10), 50);
    const offset = Math.max(parseInt(url.searchParams.get("offset") || "0", 10), 0);

    // Empty query -> empty results (avoid returning everything)
    if (!q) {
      return NextResponse.json({ ok: true, hits: [], limit, offset, processingTimeMs: 0 });
    }

    const res = await fetch(`${HOST.replace(/\/+$/,"")}/indexes/${encodeURIComponent(INDEX)}/search`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-Meili-API-Key": KEY,
      },
      body: JSON.stringify({
        q,
        limit,
        offset,
        attributesToRetrieve: ["id", "slug", "name", "shortDesc", "category", "updatedAt", "versionsCount"],
      }),
      // we don’t cache search
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json({ ok: false, error: `Meili error ${res.status}: ${text}` }, { status: 502 });
    }

    const json = await res.json();
    const hits: Hit[] = json.hits ?? [];
    return NextResponse.json({
      ok: true,
      hits,
      limit,
      offset,
      total: json.estimatedTotalHits ?? json.nbHits ?? undefined,
      processingTimeMs: json.processingTimeMs,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Search failed" }, { status: 500 });
  }
}
