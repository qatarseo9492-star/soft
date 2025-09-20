import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { slugify } from "@/lib/slug";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ------------------------------ helpers ------------------------------ */
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
    name,
    slug,
    shortDesc,
    longDesc,
    license,
    os,
    categories,
    seoTitle,
    seoDescription,
    vendor,
    version,
    fileSizeBytes,
    featuredImage,
    faqs,
    systemRequirements,
  };
}

/* ------------------------------ GET (list) ------------------------------ */
export async function GET() {
  try {
    // quick DB ping to surface connection problems in the response body
    await db.$queryRaw`SELECT 1`;

    const items = await db.software.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        os: true,
        license: true,
        updatedAt: true,
        featuredImage: true,
        version: true,
        // NOTE: if you later need categories here, use the pivot safely:
        // categories: { select: { category: { select: { id: true, name: true, slug: true } } } },
      },
      take: 200,
    });

    return NextResponse.json({ ok: true, items });
  } catch (e: any) {
    console.error("ADMIN LIST ERROR:", e); // will show in pm2 logs
    return NextResponse.json(
      { ok: false, error: e?.message || "Internal error in admin list" },
      { status: 500 },
    );
  }
}

/* ------------------------------ POST (create) ------------------------------ */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const d = parseBody(body);

    const created = await db.software.create({
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
        faqs: d.faqs, // LONGTEXT JSON string
        systemRequirements: d.systemRequirements, // LONGTEXT JSON string
        ...(d.categories.length
          ? {
              // pivot table: SoftwareCategory -> connect Category by slug
              categories: {
                create: d.categories.map((slug) => ({ category: { connect: { slug } } })),
              },
            }
          : {}),
      },
      select: { id: true, slug: true },
    });

    return NextResponse.json({ ok: true, id: created.id, slug: created.slug });
  } catch (e: any) {
    console.error("ADMIN CREATE ERROR:", e);
    return NextResponse.json(
      { ok: false, error: e?.message || "Create failed" },
      { status: 400 },
    );
  }
}
