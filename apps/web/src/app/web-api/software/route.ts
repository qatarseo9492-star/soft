// src/app/web-api/software/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { Prisma } from "@prisma/client";
import { slugify } from "@/lib/slug";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* utils */
function toStrNullable(v: any): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s : null;
}
function toStringArray(v: any): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x)).filter(Boolean);
}
function toNumberNullable(v: any): number | null {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function safeJSONStringify(v: any): string | null {
  if (v === undefined || v === null) return null;
  try {
    if (typeof v === "string") {
      const t = v.trim();
      if (!t) return null;
      try {
        JSON.parse(t);
        return t; // already JSON text
      } catch {
        return JSON.stringify(t);
      }
    }
    return JSON.stringify(v);
  } catch {
    return null;
  }
}

/* ----------------------------------- GET ----------------------------------- */
/**
 * Public listing with basic search.
 * NOTE: `os` is a JSON column; add DB-side JSON search later if needed.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const minRating = searchParams.get("minRating");
  // const os = searchParams.getAll("os"); // JSON filter not implemented here

  const where: Prisma.SoftwareWhereInput = {
    status: "published",
    ...(q
      ? {
          OR: [
            { name: { contains: q } },       // no `mode` for MySQL Prisma
            { shortDesc: { contains: q } },
          ],
        }
      : {}),
    // Add JSON search for `os` here if you want (DB-specific); omitted to keep types happy
  };

  if (minRating) {
    (where as any).ratingsAvg = { gte: Number(minRating) };
  }

  const items = await db.software.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      shortDesc: true,
      featuredImage: true,
      ratingsAvg: true,
      ratingsCount: true,
      version: true,
      vendor: true, // scalar text vendor
      // categories via pivot -> category
      categories: { select: { category: { select: { slug: true, name: true } } } },
    },
    take: 24,
  });

  const res = items.map((s) => ({
    ...s,
    categories: s.categories.map((x) => x.category),
  }));

  return NextResponse.json({ ok: true, items: res });
}

/* ----------------------------------- POST ---------------------------------- */
/**
 * Optional seed/create for public route (keep it if you need to POST here).
 * Admin create exists under /admin/software.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body?.name || "").trim();
    if (!name) throw new Error("Name is required");
    const slug = String(body?.slug || slugify(name));

    const data = {
      name,
      slug,
      shortDesc: toStrNullable(body?.shortDesc),
      longDesc: toStrNullable(body?.longDesc),
      license: toStrNullable(body?.license),
      os: toStringArray(body?.os),
      seoTitle: toStrNullable(body?.seoTitle),
      seoDescription: toStrNullable(body?.seoDescription),
      vendor: toStrNullable(body?.vendor),
      version: toStrNullable(body?.version),
      fileSizeBytes: toNumberNullable(body?.fileSizeBytes),
      featuredImage: toStrNullable(body?.featuredImage),
      faqs: safeJSONStringify(body?.faqs),
      systemRequirements: safeJSONStringify(body?.systemRequirements),
      ...(Array.isArray(body?.categories) && body.categories.length
        ? {
            // create rows in pivot table SoftwareCategory by connecting Category via slug
            categories: {
              create: body.categories.map((slug: string) => ({
                category: { connect: { slug } },
              })),
            },
          }
        : {}),
    };

    const created = await db.software.create({
      data,
      select: { id: true, slug: true },
    });

    return NextResponse.json({ ok: true, id: created.id, slug: created.slug });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Create failed" },
      { status: 400 },
    );
  }
}
