import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { slugify } from "@/lib/slug";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* utils */
function toStrNullable(v: any): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
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
      try { JSON.parse(t); return t; } catch { return JSON.stringify(t); }
    }
    return JSON.stringify(v);
  } catch { return null; }
}
function safeJSONParse<T = any>(v: unknown, fallback: T | null = null): T | null {
  if (typeof v !== "string") return (v as any) ?? fallback;
  const s = v.trim();
  if (!s) return fallback;
  try { return JSON.parse(s) as T; } catch { return fallback; }
}

function parseBody(body: any) {
  const name = String(body?.name || "").trim();
  if (!name) throw new Error("Name is required");
  const slug = String(body?.slug || slugify(name));
  const shortDesc = body?.shortDesc === null ? null : toStrNullable(body?.shortDesc ?? "");
  const longDesc = body?.longDesc === null ? null : toStrNullable(body?.longDesc ?? "");
  const license = toStrNullable(body?.license);
  const os = toStringArray(body?.os);
  const categories = toStringArray(body?.categories);

  const seoTitle = toStrNullable(body?.seoTitle);
  const seoDescription = toStrNullable(body?.seoDescription);
  const vendor = toStrNullable(body?.vendor);
  const version = toStrNullable(body?.version);

  let fileSizeBytes = toNumberNullable(body?.fileSizeBytes);
  const fileSizeMB = toNumberNullable(body?.fileSizeMB);
  if (fileSizeBytes == null && fileSizeMB != null) {
    fileSizeBytes = Math.round(fileSizeMB * 1024 * 1024);
  }
  const featuredImage = toStrNullable(body?.featuredImage);

  const faqs = safeJSONStringify(body?.faqs);
  const systemRequirements = safeJSONStringify(body?.systemRequirements);

  return {
    name, slug, shortDesc, longDesc, license, os, categories,
    seoTitle, seoDescription, vendor, version,
    fileSizeBytes, featuredImage, faqs, systemRequirements,
  };
}

/* GET one */
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const item = await db.software.findUnique({
    where: { id: params.id },
    select: {
      id: true, name: true, slug: true, shortDesc: true, longDesc: true,
      license: true, os: true, updatedAt: true,
      seoTitle: true, seoDescription: true, vendor: true, version: true,
      fileSizeBytes: true, featuredImage: true, faqs: true, systemRequirements: true,
      // pivot -> category
      categories: { select: { category: { select: { id: true, name: true, slug: true } } } },
    },
  });
  if (!item) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  const categories = (item.categories || []).map((x) => x.category);
  const parsed = {
    ...item,
    categories,
    faqs: safeJSONParse(item.faqs, [] as any[]),
    systemRequirements: safeJSONParse(item.systemRequirements, [] as any[]),
  };

  return NextResponse.json({ ok: true, item: parsed });
}

/* PUT update */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json().catch(() => ({}));
    const d = parseBody(body);

    const updated = await db.software.update({
      where: { id: params.id },
      data: {
        name: d.name,
        slug: d.slug,
        shortDesc: d.shortDesc,
        longDesc: d.longDesc,
        license: d.license,
        os: d.os,
        seoTitle: d.seoTitle,
        seoDescription: d.seoDescription,
        vendor: d.vendor,
        version: d.version,
        fileSizeBytes: d.fileSizeBytes,
        featuredImage: d.featuredImage,
        faqs: d.faqs,
        systemRequirements: d.systemRequirements,
        // explicit pivot update: wipe and recreate by slug
        categories: {
          deleteMany: {},
          ...(d.categories.length
            ? { create: d.categories.map((slug) => ({ category: { connect: { slug } } })) }
            : {}),
        },
      },
      select: { id: true, slug: true },
    });

    return NextResponse.json({ ok: true, id: updated.id, slug: updated.slug });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Update failed" }, { status: 400 });
  }
}

/* allow _method=DELETE */
export async function POST(req: NextRequest, ctx: any) {
  const body = await req.formData().catch(() => null);
  if (body?.get("_method") === "DELETE") return DELETE(req, ctx);
  return NextResponse.json({ ok: false, error: "Unsupported" }, { status: 400 });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await db.software.delete({ where: { id: params.id } });
  return NextResponse.redirect("/admin/software", { status: 303 });
}
