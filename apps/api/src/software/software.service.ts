import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SoftwareService {
  constructor(private prisma: PrismaService) {}

  async list(params: {
    q?: string; category?: string; os?: string; license?: string;
    sort?: 'updated' | 'new' | 'downloads'; limit: number; page: number;
  }) {
    const { q, category, os, license, sort, limit, page } = params;

    const where: Prisma.SoftwareWhereInput = {};

    if (q) {
      where.OR = [
        { name: { contains: q } },
        { shortDesc: { contains: q } },
        { longDesc: { contains: q } },
        { vendor: { name: { contains: q } } },
        { tags: { some: { name: { contains: q } } } },
      ];
    }

    if (license) where.license = { equals: license };
    // if you later normalize OS, change this to a relation filter
    if (os) where.os = { equals: [os] as any };

    if (category) {
      where.categories = {
        some: {
          OR: [
            { category: { slug: category } },
            { category: { name: { contains: category } } },
          ],
        },
      };
    }

    let orderBy: Prisma.SoftwareOrderByWithRelationInput = { updatedAt: 'desc' };
    if (sort === 'new') orderBy = { createdAt: 'desc' };
    if (sort === 'downloads') orderBy = { counter: { total: 'desc' } as any };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.software.findMany({
        where,
        orderBy,
        take: limit,
        skip: (page - 1) * limit,
        select: {
          id: true,
          slug: true,
          name: true,
          vendor: { select: { name: true } },
          license: true,
          os: true,
          updatedAt: true,
          heroUrl: true,
          versions: {
            take: 1,
            orderBy: { releasedAt: 'desc' },
            select: { version: true },
          },
        },
      }),
      this.prisma.software.count({ where }),
    ]);

    const normalized = items.map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      vendor: { name: s.vendor?.name ?? null },
      version: s.versions?.[0]?.version ?? null,
      os: (s.os as string[] | null) ?? [],
      license: s.license ?? null,
      updatedAt: s.updatedAt,
      heroImage: s.heroUrl ?? null,
    }));

    return { ok: true, total, page, limit, items: normalized };
  }

  async detail(slug: string) {
    const s = await this.prisma.software.findUnique({
      where: { slug },
      include: {
        vendor: true,
        categories: { include: { category: true } },
        versions: {
          orderBy: { releasedAt: 'desc' },
          include: {
            builds: {
              orderBy: [{ os: 'asc' }, { arch: 'asc' }],
              include: { mirrors: { orderBy: { priority: 'asc' } } },
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
        description: s.longDesc,
        homepage: s.homepage,
        license: s.license,
        os: (s.os as string[] | null) ?? [],
        categories: s.categories.map((c) => c.category.name),
        vendor: s.vendor ? { name: s.vendor.name } : null,
        latestVersion: s.versions[0]?.version ?? null,
        updatedAt: s.updatedAt,
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
            sizeMB: b.sizeMB,
            sha256: b.sha256,
            downloadUrl: b.downloadUrl ?? b.mirrors[0]?.url ?? null,
          })),
        })),
      },
    };
  }

  async logDownload(args: { slug: string; buildId?: string | null; ip?: string; ua?: string }) {
    const sw = await this.prisma.software.findUnique({
      where: { slug: args.slug },
      select: { id: true },
    });
    if (!sw) return null;

    await this.prisma.downloadLog.create({
      data: {
        softwareId: sw.id,
        buildId: args.buildId ?? null,
        ip: args.ip?.slice(0, 45) ?? null,
        ua: args.ua?.slice(0, 191) ?? null,
      },
    });
    return { ok: true };
  }
}