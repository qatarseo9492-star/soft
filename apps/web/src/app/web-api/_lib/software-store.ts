// apps/web/src/app/web-api/_lib/software-store.ts
import db from "@/lib/db";

/**
 * Prisma models used here (from web schema):
 * - Software
 * - Version
 * - Build
 * - Mirror
 * - DownloadLog
 * - DownloadCounter (optional ordering by total)
 *
 * Notes:
 * - Keep string filters simple (no `mode: "insensitive"`) to stay MySQL-compatible.
 * - Use loose types to avoid compile breaks if the schema evolves.
 */

/* ===========================
   Software helpers
=========================== */

export function presentSoftware(s: any) {
  if (!s) return null;
  return {
    id: s.id,
    slug: s.slug,
    name: s.name,
    shortDesc: s.shortDesc ?? null,
    longDesc: s.longDesc ?? null,
    categoryId: s.categoryId ?? null, // harmless if not present in your schema
    vendorId: s.vendorId ?? null,
    iconUrl: s.iconUrl ?? null,
    heroUrl: s.heroUrl ?? null,
    websiteUrl: s.websiteUrl ?? null,
    isFree: !!s.isFree,
    publishedAt: s.publishedAt ?? null,
    published: !!s.publishedAt,
    updatedAt: s.updatedAt,
  };
}

// Transform arbitrary body to Prisma update/create subsets (safe fields only)
export function toUpdateData(body: any): any {
  const out: any = {};
  if (!body || typeof body !== "object") return out;
  const fields = [
    "name",
    "slug",
    "categoryId",
    "vendorId",
    "shortDesc",
    "longDesc",
    "iconUrl",
    "heroUrl",
    "websiteUrl",
    "isFree",
  ];
  for (const k of fields) {
    if (k in body) out[k] = (body as any)[k];
  }
  if ("published" in body) {
    out.publishedAt = body.published ? new Date() : null;
  }
  return out;
}

export async function createSoftware(data: any) {
  return db.software.create({ data });
}

export async function updateSoftware(id: string, body: any) {
  const data = toUpdateData(body);
  const updated = await db.software.update({ where: { id }, data });
  return presentSoftware(updated);
}

export async function deleteSoftware(id: string) {
  await db.software.delete({ where: { id } });
  return { ok: true };
}

/* ===========================
   Version helpers
=========================== */

export async function getVersion(id: string) {
  return db.version.findUnique({
    where: { id },
    include: {
      builds: {
        include: { mirrors: { orderBy: { priority: "asc" } } },
        orderBy: [{ os: "asc" }, { arch: "asc" }],
      },
    },
  });
}

export async function createVersion(softwareId: string, data: any) {
  return db.version.create({
    data: {
      softwareId,
      version: String(data?.version ?? ""),
      // web schema uses `osLabel` (not `os`) on Version
      osLabel: (data?.os ?? data?.osLabel) ?? null,
      license: data?.license ?? null,
      changelog: data?.changelog ?? null,
      releasedAt: data?.releasedAt ? new Date(data.releasedAt) : null,
    },
  });
}

export async function updateVersion(id: string, data: any) {
  const patch: any = {};
  if ("version" in data) patch.version = String(data.version);
  if ("os" in data || "osLabel" in data) patch.osLabel = (data.os ?? data.osLabel) ?? null;
  if ("license" in data) patch.license = data.license ?? null;
  if ("changelog" in data) patch.changelog = data.changelog ?? null;
  if ("releasedAt" in data) patch.releasedAt = data.releasedAt ? new Date(data.releasedAt) : null;

  return db.version.update({ where: { id }, data: patch });
}

export async function deleteVersion(id: string) {
  await db.version.delete({ where: { id } });
  return { ok: true };
}

/* ===========================
   Build helpers
=========================== */

export async function listBuilds(versionId: string) {
  return db.build.findMany({
    where: { versionId },
    include: { mirrors: true },
    orderBy: [{ os: "asc" }, { arch: "asc" }],
  });
}

export async function getBuild(id: string) {
  return db.build.findUnique({
    where: { id },
    include: { mirrors: true, version: true },
  });
}

export async function createBuild(versionId: string, data: any) {
  return db.build.create({
    data: {
      versionId,
      os: data?.os ?? null,
      arch: data?.arch ?? null,
      buildType: data?.buildType ?? null,
      sizeMB: data?.sizeMB ?? null,
      fileSize: data?.fileSize ?? null,
      sha256: data?.sha256 ?? null,
      downloadUrl: data?.downloadUrl ?? null,
    },
  });
}

export async function updateBuild(id: string, data: any) {
  const patch: any = {};
  for (const k of ["os", "arch", "buildType", "sizeMB", "fileSize", "sha256", "downloadUrl"]) {
    if (k in data) patch[k] = (data as any)[k];
  }
  return db.build.update({ where: { id }, data: patch });
}

export async function deleteBuild(id: string) {
  await db.build.delete({ where: { id } });
  return { ok: true };
}

/* ===========================
   Mirror helpers
=========================== */

export async function createMirror(buildId: string, data: any) {
  return db.mirror.create({
    data: {
      buildId,
      title: data?.title ?? "Mirror",
      url: String(data?.url ?? ""),
      priority: typeof data?.priority === "number" ? data.priority : 100,
    },
  });
}

export async function updateMirror(id: string, data: any) {
  const patch: any = {};
  if ("title" in data) patch.title = data.title;
  if ("url" in data) patch.url = data.url;
  if ("priority" in data) patch.priority = data.priority;
  return db.mirror.update({ where: { id }, data: patch });
}

export async function deleteMirror(id: string) {
  await db.mirror.delete({ where: { id } });
  return { ok: true };
}

/* ===========================
   Public list (used by /web-api/software)
=========================== */

export async function listSoftwares(params: {
  q?: string;
  category?: string; // slug or name substring
  os?: string;
  license?: string;
  sort?: "updated" | "new" | "downloads";
  limit?: number;
  page?: number;
}) {
  const {
    q,
    category,
    os,
    license,
    sort = "updated",
    limit = 24,
    page = 1,
  } = params || {};

  const where: any = {};
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { slug: { contains: q } },
      { shortDesc: { contains: q } },
      { longDesc: { contains: q } },
    ];
  }
  if (license) where.license = { equals: license };
  if (os) where.os = { path: "$", array_contains: [os] } as any;

  // If your schema uses many-to-many categories via SoftwareCategory -> Category
  if (category) {
    where.categories = {
      some: {
        category: {
          OR: [
            { slug: category },
            { name: { contains: category } },
          ],
        },
      },
    };
  }

  let orderBy: any = { updatedAt: "desc" };
  if (sort === "new") orderBy = { createdAt: "desc" };
  if (sort === "downloads") {
    // If DownloadCounter relation exists, order by it; fallback to updatedAt otherwise
    orderBy = [{ counter: { total: "desc" } }, { updatedAt: "desc" }];
  }

  const take = Math.min(Math.max(Number(limit) || 24, 1), 100);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const [items, total] = await db.$transaction([
    db.software.findMany({
      where,
      orderBy,
      take,
      skip,
      select: {
        id: true,
        slug: true,
        name: true,
        license: true,
        os: true,
        updatedAt: true,
        iconUrl: true,
        heroUrl: true,
        vendorRef: { select: { name: true } },
        versions: {
          take: 1,
          orderBy: [{ releasedAt: "desc" }, { createdAt: "desc" }],
          select: { version: true },
        },
        counter: true, // optional
      },
    }),
    db.software.count({ where }),
  ]);

  const normalized = items.map((s: any) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    vendor: { name: s.vendor?.name ?? null },
    version: s.versions?.[0]?.version ?? null,
    os: (s.os as string[] | null) ?? [],
    license: s.license ?? null,
    updatedAt: s.updatedAt,
    iconUrl: s.iconUrl ?? null,
    heroUrl: s.heroUrl ?? null,
    downloads: s.counter?.total ?? 0,
  }));

  return { ok: true, total, page: Math.max(Number(page) || 1, 1), limit: take, items: normalized };
}

/* ===========================
   Stats (top by period)
=========================== */

export async function topByPeriod(period: "daily" | "weekly" | "monthly" = "weekly", limit = 10) {
  const now = Date.now();
  const since =
    period === "daily" ? new Date(now - 1 * 24 * 60 * 60 * 1000) :
    period === "monthly" ? new Date(now - 30 * 24 * 60 * 60 * 1000) :
    new Date(now - 7 * 24 * 60 * 60 * 1000);

  const grouped = await db.downloadLog.groupBy({
  by: ["softwareId"],
  where: { createdAt: { gte: since } },
  _count: { _all: true },
  // Order by the count of a grouped field (softwareId) instead of _all
  orderBy: { _count: { softwareId: "desc" } },
  take: limit,
});

  if (!grouped.length) return { ok: true, items: [] as any[] };

  const ids = grouped.map((g: any) => g.softwareId);
  const softwares = await db.software.findMany({
    where: { id: { in: ids } },
    select: {
      id: true, slug: true, name: true, iconUrl: true, heroUrl: true,
      versions: {
        take: 1, orderBy: [{ releasedAt: "desc" }, { createdAt: "desc" }],
        select: { version: true },
      },
      counter: true,
    },
  });

  const scoreMap = Object.fromEntries(grouped.map((g: any) => [g.softwareId, g._count._all]));
  const out = softwares
    .map((s: any) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      iconUrl: s.iconUrl ?? null,
      heroUrl: s.heroUrl ?? null,
      version: s.versions?.[0]?.version ?? null,
      recentDownloads: scoreMap[s.id] ?? 0,
      totalDownloads: s.counter?.total ?? 0,
    }))
    // Keep same order as grouped
    .sort((a: any, b: any) => (scoreMap[b.id] ?? 0) - (scoreMap[a.id] ?? 0));

  return { ok: true, items: out };
}

/* ===========================
   Download chooser + logger
=========================== */

type ChosenBuild = {
  url: string;
  buildId: string | null;
  versionId: string | null;
  softwareId: string; // ALWAYS present
};

export async function chooseBuildUrlBySlug(
  slug: string,
  opts?: {
    id?: string | null;
    prefer?: { os?: string | null; arch?: string | null; buildType?: string | null };
  }
): Promise<ChosenBuild | null> {
  // If explicit build id is provided, fetch along with version -> softwareId
  if (opts?.id) {
    const b = await db.build.findUnique({
      where: { id: opts.id },
      include: {
        mirrors: { orderBy: { priority: "asc" } },
        version: { select: { softwareId: true } },
      },
    });
    if (!b) return null;
    const url = b.downloadUrl ?? b.mirrors?.[0]?.url ?? null;
    if (!url) return null;

    const softwareId = b.version?.softwareId;
    if (!softwareId) return null;

    return { url, buildId: b.id, versionId: b.versionId ?? null, softwareId };
  }

  // No explicit build: pick from the latest versions and best-matching build
  const s = await db.software.findUnique({
    where: { slug },
    select: {
      id: true,
      versions: {
        orderBy: [{ releasedAt: "desc" }, { createdAt: "desc" }],
        include: {
          builds: { include: { mirrors: { orderBy: { priority: "asc" } } } },
        },
        take: 3,
      },
    },
  });
  if (!s) return null;

  const prefer = opts?.prefer ?? {};
  const candidates =
    s.versions
      ?.flatMap((v: any) => v.builds.map((b: any) => ({ v, b })))
      ?.sort((a: any, b: any) => {
        const score = (x: any) =>
          (prefer.os && x.b.os === prefer.os ? 4 : 0) +
          (prefer.arch && x.b.arch === prefer.arch ? 2 : 0) +
          (prefer.buildType && x.b.buildType === prefer.buildType ? 1 : 0);
        return score(b) - score(a);
      }) ?? [];

  const picked = candidates[0];
  if (!picked) return null;
  const url = picked.b.downloadUrl ?? picked.b.mirrors?.[0]?.url ?? null;
  if (!url) return null;

  return {
    url,
    buildId: picked.b.id,
    versionId: picked.b.versionId ?? null,
    softwareId: s.id,
  };
}

export async function logDownloadByIds(input: {
  softwareId: string;
  versionId?: string | null;
  buildId?: string | null;
  ip?: string | null;
  ua?: string | null;
  referer?: string | null;
}) {
  try {
    await db.downloadLog.create({
      data: {
        softwareId: input.softwareId,
        versionId: input.versionId ?? null,
        buildId: input.buildId ?? null,
        ip: input.ip?.slice(0, 45) ?? null,
        ua: input.ua?.slice(0, 191) ?? null,
        referer: input.referer?.slice(0, 191) ?? null,
      },
    });
  } catch {
    // best-effort; never throw from logging
  }
}
