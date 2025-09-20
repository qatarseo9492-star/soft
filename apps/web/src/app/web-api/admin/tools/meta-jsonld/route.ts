import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST body: { id?: string, slug?: string }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const where = body?.id ? { id: String(body.id) } : body?.slug ? { slug: String(body.slug) } : null;
  if (!where) return NextResponse.json({ ok: false, error: "id or slug required" }, { status: 400 });

  const software = await db.software.findUnique({
    where,
    select: {
      id: true, name: true, slug: true, shortDesc: true, longDesc: true,
      vendor: true, version: true, featuredImage: true, seoTitle: true, seoDescription: true,
      // relation is vendorRef (not vendor)
      vendorRef: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!software) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  const urlBase = process.env.NEXT_PUBLIC_SITE_URL || "";
  const pageUrl = `${urlBase}/software/${software.slug}`;

  const jsonld: any = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: software.seoTitle || software.name,
    description: software.seoDescription || software.shortDesc || undefined,
    applicationCategory: "SoftwareApplication",
    operatingSystem: undefined, // can be filled from `os` if needed
    softwareVersion: software.version || undefined,
    image: software.featuredImage ? `${urlBase}${software.featuredImage}` : undefined,
    url: pageUrl,
    author: software.vendorRef?.name || software.vendor || undefined,
    publisher: software.vendorRef?.name || software.vendor || undefined,
  };

  return NextResponse.json({ ok: true, jsonld });
}
