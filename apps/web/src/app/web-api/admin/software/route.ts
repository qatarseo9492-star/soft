export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
import { NextRequest, NextResponse } from "next/server";
import db from "../../_lib/db";

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

/**
 * GET /web-api/admin/software
 * Lists software for the admin grid.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const take = Math.min(Number(searchParams.get("take") || 20), 100);
  const skip = Math.max(Number(searchParams.get("skip") || 0), 0);

  const items = await db.software.findMany({
    where: undefined,
    take,
    skip,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      shortDesc: true,
      // ⬇️ use publishedAt, not `published`
      publishedAt: true,
      updatedAt: true,
      _count: { select: { versions: true } },
    },
  });

  // expose a boolean `published` for the UI, derived from publishedAt
  const mapped = items.map((s) => ({
    ...s,
    published: !!s.publishedAt,
  }));

  return NextResponse.json({ ok: true, items: mapped, total: mapped.length });
}

/**
 * POST /web-api/admin/software
 * Creates a new software item
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const {
    name,
    slug,
    categoryId,
    vendorId,
    shortDesc,
    longDesc,
    iconUrl,
    heroUrl,
    websiteUrl,
    isFree,
    published, // boolean from UI
  } = body || {};

  if (!name || !slug || !categoryId) {
    return bad("name, slug, and categoryId are required");
  }

  const data: any = {
    name: String(name),
    slug: String(slug),
    categoryId: String(categoryId),
    vendorId: vendorId ? String(vendorId) : null,
    shortDesc: shortDesc ?? null,
    longDesc: longDesc ?? null,
    iconUrl: iconUrl ?? null,
    heroUrl: heroUrl ?? null,
    websiteUrl: websiteUrl ?? null,
    isFree: typeof isFree === "boolean" ? isFree : true,
    // ⬇️ map boolean to timestamp column
    publishedAt: typeof published === "boolean" ? (published ? new Date() : null) : null,
  };

  const created = await db.software.create({ data });
  return NextResponse.json({ ok: true, item: { ...created, published: !!created.publishedAt } }, { status: 201 });
}
