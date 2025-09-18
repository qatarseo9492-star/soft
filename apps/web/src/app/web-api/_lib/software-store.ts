import db from "./db";
import type { Prisma } from "@prisma/client";

/* ===========================
   Software helpers / types
=========================== */

export type ListParams = {
  q?: string;
  category?: string;
  os?: string;          // kept for future use (JSON filter)
  license?: string;
  sort?: "updated" | "new" | "downloads";
  limit?: number;
  page?: number;
};

export async function list(params: ListParams) {
  const {
    q,
    category,
    os,          // not applied yet (MySQL JSON filters can be finicky)
    license,
    sort = "updated",
    limit = 24,
    page = 1,
  } = params ?? {};

  const where: Prisma.SoftwareWhereInput = {
    // If you store status "published", keep this filter; otherwise remove it.
    status: { equals: "published" },
  };

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { shortDesc: { contains: q, mode: "insensitive" } },
      { longDesc: { contains: q, mode: "insensitive" } },
    ];
  }

  if (license) where.license = { equals: license };

  if (category) {
    where.categories = {
      some: {
        category: {
          OR: [
            { slug: category },
            { name: { contains: category, mode: "insensitive" } },
          ],
        },
      },
    };
  }

  let orderBy: Prisma.SoftwareOrderByWithRelationInput = { lastUpdatedAt: "desc" };
  if (sort === "new") orderBy = { createdAt: "desc" };
  if (sort === "downloads") {
    // Requires the materialized counter row; safe even if null (left join).
    orderBy = { counter: { total: "desc" } };
  }

  const [items, total] = await db.$transaction([
    db.software.findMany({
      where,
      orderBy,
      take: limit,
      skip: (page - 1) * limit,
      select: {
        id: true,
        slug: true,
        name: true,
        license: true,
        iconUrl: true,
        lastUpdatedAt: true,
        vendor: { select: { name: true } },
        // latest version (by releasedAt desc)
        versions: {
          take: 1,
          orderBy: { releasedAt: "desc" },
          select: { version: true },
        },
      },
    }),
    db.software.count({ where }),
  ]);

  const normalized = items.map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    vendor: { name: s.vendor?.name ?? null },
    version: s.versions?.[0]?.version ?? null,
    license: s.license ?? null,
    updatedAt: s.lastUpdatedAt,
    icon: s.iconUrl ?? null,
  }));

  return { ok: true, total, page, limit, items: normalized };
}

export async function detail(slug: string) {
  const s = await db.software.findUnique({
    where: { slug },
    include: {
      vendor: true,
      categories: { include: { category: true } },
      versions: {
        orderBy: { releasedAt: "desc" },
        include: {
          builds: {
            orderBy: [{ os: "asc" }, { arch: "asc" }],
            include: { mirrors: { orderBy: { priority: "asc" } } },
          },
        },
      },
    },
  });

  if (!s) return null;

  return {
    ok: true,
    software: {
      id: s.id,
      slug: s.slug,
      name: s.name,
      description: s.longDesc ?? s.shortDesc ?? null,
      homepage: s.homepage,
      license: s.license,
      os: (s.os as string[] | null) ?? [],
      categories: s.categories.map((c) => c.category.name),
      vendor: s.vendor ? { name: s.vendor.name } : null,
      latestVersion: s.versions[0]?.version ?? null,
      updatedAt: s.lastUpdatedAt,
      heroImage: s.heroUrl ?? null,
      versions: s.versions.map((v) => ({
        id: v.id,
        version: v.version,
        releasedAt: v.releasedAt,
        changelog: v.changelog,
        builds: v.builds.map((b) => ({
          id: b.id,
          os: b.os,
          arch: b.arch,
          sizeMB: b.sizeMB ?? undefined,
          sha256: b.sha256 ?? undefined,
          downloadUrl: b.downloadUrl ?? b.mirrors[0]?.url ?? null,
        })),
      })),
    },
  };
}