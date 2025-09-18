export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const file = searchParams.get("file");
  if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 });

  // TODO: push event to your API / analytics queue (fire-and-forget)
  // fetch(`${process.env.API_BASE_SERVER}/v1/events`, { method: "POST", body: JSON.stringify({...}) }).catch(() => {});

  const target = `${process.env.NEXT_PUBLIC_SITE_URL || ""}/downloads/${encodeURIComponent(file)}`;
  return NextResponse.redirect(target, 308);
}
