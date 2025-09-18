// src/software/software.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma, CommentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// -----------------------------
// Query params typing
// -----------------------------
type ListParams = {
  q?: string;
  category?: string; // category slug
  vendor?: string;   // vendor slug
  tag?: string;      // tag slug
  os?: string;       // SoftwareVersion.os
  license?: string;  // SoftwareVersion.license
  badge?: 'latest' | 'updated' | 'recommended' | 'new';
  status?: string;   // e.g. 'PUBLISHED' | 'DRAFT'
  sort?: 'updated' | 'new' | 'rating' | 'name' | 'downloads';
  page?: number;
  limit?: number;
};

// tiny slug helper
const sluggify = (s: string) =>
  String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// map badge → boolean column on Software
const badgeColumn: Record<NonNullable<ListParams['badge']>, keyof Prisma.SoftwareWhereInput> = {
  latest: 'isLatest',
  updated: 'isUpdated',
  recommended: 'isRecommended',
  new: 'isNew',
};

@Injectable()
export class SoftwareService {
  constructor(private prisma: PrismaService) {}

  // ------------------------------------------------------------------
  // READ ONE (with newest version + builds, media, FAQs, requirements)
  // ------------------------------------------------------------------
  async getBySlug(slug: string) {
    const software = await this.prisma.software.findUnique({
      where: { slug },
      include: {
        category: true,
        vendor: true,
        tags: true,
        media: { orderBy: { order: 'asc' } },
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            builds: { orderBy: { createdAt: 'desc' } },
          },
        },
        faqs: { orderBy: { order: 'asc' } },
        requirements: true,
        comments: {
          where: { status: CommentStatus.APPROVED },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!software) throw new NotFoundException('Software not found');
    return software;
  }

  // ------------------------------------------------------------------
  // LIST (filters + sorts)
  // ------------------------------------------------------------------
  async list({
    q,
    category,
    vendor,
    tag,
    os,
    license,
    badge,
    status,
    sort = 'updated',
    page = 1,
    limit = 20,
  }: ListParams) {
    const where: Prisma.SoftwareWhereInput = {};

    if (status) (where as any).status = status; // cast to allow string enum from client

    const term = q?.trim();
    if (term) {
      // schema uses shortDesc / longDesc
      where.OR = [
        { name: { contains: term } },
        { shortDesc: { contains: term } },
        { longDesc: { contains: term } },
      ];
    }

    if (category) where.category = { is: { slug: category } };
    if (vendor) where.vendor = { is: { slug: vendor } };
    if (tag) where.tags = { some: { slug: tag } };

    if (os || license) {
      where.versions = {
        some: {
          ...(os ? { os: os as any } : {}),
          ...(license ? { license: license as any } : {}),
        },
      };
    }

    if (badge) {
      const col = badgeColumn[badge];
      (where as any)[col] = true;
    }

    const orderBy: Prisma.SoftwareOrderByWithRelationInput =
      sort === 'new'
        ? { createdAt: 'desc' }
        : sort === 'rating'
        ? { ratingsAvg: 'desc' as any }
        : sort === 'name'
        ? { name: 'asc' }
        : sort === 'downloads'
        ? ({ downloads: { _count: 'desc' } } as any) // if you have a downloads relation
        : { lastUpdatedAt: 'desc' }; // 'updated' default

    const take = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = Math.max(0, (Math.max(1, Number(page) || 1) - 1) * take);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.software.findMany({
        where,
        include: {
          category: true,
          vendor: true,
          tags: true,
          media: { orderBy: { order: 'asc' }, take: 6 },
          versions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              builds: { orderBy: { createdAt: 'desc' } },
            },
          },
        },
        orderBy,
        skip,
        take,
      }),
      this.prisma.software.count({ where }),
    ]);

    return { items, total, page, pages: Math.ceil(total / take) };
  }

  // ------------------------------------------------------------------
  // CREATE (maps shortDescription/description → shortDesc/longDesc)
  // Supports optional: tags[], media[], versions[] (+ builds[])
  // ------------------------------------------------------------------
  async create(dto: any) {
    if (!dto) throw new BadRequestException('Body is required');

    const {
      // accepted aliases and canonical names
      name,
      title,
      slug,
      status,
      shortDescription,
      description,
      shortDesc,
      longDesc,

      // relations / nested
      tags,
      media,
      versions,
      categorySlug,
      vendorSlug,

      // any other top-level columns you may have
      ...rest
    } = dto;

    const nameVal = name ?? title;
    if (!nameVal || !String(nameVal).trim()) {
      throw new BadRequestException('Field "name" is required');
    }

    const computedSlug = slug || sluggify(nameVal);
    const shortDescVal = (shortDescription ?? shortDesc) ?? '';
    const longDescVal = (description ?? longDesc) ?? '';

    // Resolve category/vendor by slug if provided (optional)
    const [category, vendor] = await Promise.all([
      categorySlug ? this.prisma.category.findUnique({ where: { slug: categorySlug } }) : null,
      vendorSlug ? this.prisma.vendor.findUnique({ where: { slug: vendorSlug } }) : null,
    ]);

    if (categorySlug && !category) {
      throw new BadRequestException(`Category not found: ${categorySlug}`);
    }
    if (vendorSlug && !vendor) {
      throw new BadRequestException(`Vendor not found: ${vendorSlug}`);
    }

    // Build create payload
    const base: any = {
      ...(rest || {}), // allow extra typed columns you might have
      name: nameVal,
      slug: computedSlug,
      shortDesc: shortDescVal,
      longDesc: longDescVal,
      lastUpdatedAt: new Date(),
      ...(status ? { status } : {}),
      ...(category ? { category: { connect: { id: category.id } } } : {}),
      ...(vendor ? { vendor: { connect: { id: vendor.id } } } : {}),
    };

    if (Array.isArray(media) && media.length) {
      base.media = { create: media.map((m: any) => ({ ...m })) };
    }

    if (Array.isArray(tags) && tags.length) {
      base.tags = {
        connectOrCreate: tags.map((t: any) => {
          const tSlug = sluggify(typeof t === 'string' ? t : t?.slug || t?.name);
          const tName = typeof t === 'string' ? t : t?.name || tSlug;
          return {
            where: { slug: tSlug },
            create: { name: tName, slug: tSlug },
          };
        }),
      };
    }

    if (Array.isArray(versions) && versions.length) {
      base.versions = {
        create: versions.map((v: any) => ({
          ...v,
          ...(Array.isArray(v?.builds) && v.builds.length
            ? { builds: { create: v.builds.map((b: any) => ({ ...b })) } }
            : {}),
        })),
      };
    }

    const created = await this.prisma.software.create({
      data: base as Prisma.SoftwareCreateInput,
      include: {
        category: true,
        vendor: true,
        tags: true,
      },
    });

    await this.revalidate(created.slug);
    return created;
  }

  // ------------------------------------------------------------------
  // UPDATE (maps shortDescription/description → shortDesc/longDesc)
  // If tags[] provided, replaces associations.
  // ------------------------------------------------------------------
  async update(id: string, dto: any) {
    if (!id) throw new BadRequestException('Missing id');
    if (!dto) throw new BadRequestException('Body is required');

    const {
      name,
      title,
      slug,
      status,
      shortDescription,
      description,
      shortDesc,
      longDesc,
      tags,
      ...rest
    } = dto;

    const data: Prisma.SoftwareUpdateInput = {
      ...(rest as any),
      lastUpdatedAt: new Date(),
    };

    if (name || title) data.name = (name ?? title) as any;
    if (slug) data.slug = slug;
    if (status) (data as any).status = status;
    if (shortDescription || shortDesc) data.shortDesc = (shortDescription ?? shortDesc) as any;
    if (description || longDesc) data.longDesc = (description ?? longDesc) as any;

    const updated = await this.prisma.software.update({
      where: { id },
      data,
    });

    // replace tags if provided
    if (Array.isArray(tags)) {
      // clear
      await this.prisma.software.update({
        where: { id },
        data: { tags: { set: [] } },
      });

      if (tags.length) {
        await this.prisma.software.update({
          where: { id },
          data: {
            tags: {
              connectOrCreate: tags.map((t: any) => {
                const tSlug = sluggify(typeof t === 'string' ? t : t?.slug || t?.name);
                const tName = typeof t === 'string' ? t : t?.name || tSlug;
                return {
                  where: { slug: tSlug },
                  create: { name: tName, slug: tSlug },
                };
              }),
            },
          },
        });
      }
    }

    // get slug to revalidate (could have changed)
    const fresh = await this.prisma.software.findUnique({
      where: { id },
      select: { slug: true },
    });

    if (fresh?.slug) await this.revalidate(fresh.slug);
    return updated;
  }

  // ------------------------------------------------------------------
  // VERSION & BUILD helpers
  // ------------------------------------------------------------------
  async addVersion(softwareId: string, dto: any) {
    const v = await this.prisma.softwareVersion.create({
      data: {
        ...dto,
        softwareId,
        ...(Array.isArray(dto?.builds) && dto.builds.length
          ? { builds: { create: dto.builds.map((b: any) => ({ ...b })) } }
          : {}),
      },
      include: { builds: true },
    });

    const s = await this.prisma.software.update({
      where: { id: softwareId },
      data: { lastUpdatedAt: new Date(), isUpdated: true },
      select: { slug: true },
    });

    if (s.slug) await this.revalidate(s.slug);
    return v;
  }

  async addBuild(versionId: string, dto: any) {
    const build = await this.prisma.softwareBuild.create({
      data: { ...dto, versionId },
    });

    const version = await this.prisma.softwareVersion.findUnique({
      where: { id: versionId },
      select: { softwareId: true, software: { select: { slug: true } } },
    });

    if (version?.softwareId) {
      await this.prisma.software.update({
        where: { id: version.softwareId },
        data: { lastUpdatedAt: new Date(), isUpdated: true },
      });
      if (version.software?.slug) await this.revalidate(version.software.slug);
    }
    return build;
  }

  async addMedia(softwareId: string, dto: any) {
    const media = await this.prisma.softwareMedia.create({
      data: { ...dto, softwareId },
    });
    const s = await this.prisma.software.update({
      where: { id: softwareId },
      data: { lastUpdatedAt: new Date() },
      select: { slug: true },
    });
    if (s.slug) await this.revalidate(s.slug);
    return media;
  }

  // ------------------------------------------------------------------
  // BULK actions
  // ------------------------------------------------------------------
  async bulkUpdateStatus(ids: string[], status: string) {
    if (!Array.isArray(ids) || !ids.length) return { count: 0 };
    const result = await this.prisma.software.updateMany({
      where: { id: { in: ids } },
      data: { status: status as any, lastUpdatedAt: new Date() },
    });
    return { count: result.count };
  }

  async bulkToggleBadge(
    ids: string[],
    badge: 'latest' | 'updated' | 'recommended' | 'new',
    value: boolean,
  ) {
    if (!Array.isArray(ids) || !ids.length) return { count: 0 };
    const data: any = {};
    data[badgeColumn[badge] as string] = value;
    const result = await this.prisma.software.updateMany({
      where: { id: { in: ids } },
      data,
    });
    return { count: result.count };
  }

  async bulkDelete(ids: string[]) {
    if (!Array.isArray(ids) || !ids.length) return { count: 0 };
    const result = await this.prisma.software.deleteMany({
      where: { id: { in: ids } },
    });
    return { count: result.count };
  }

  // ------------------------------------------------------------------
  // Revalidation webhook (Next.js/other)
  // ------------------------------------------------------------------
  private async revalidate(slug: string) {
    const url = process.env.WEB_REVALIDATE_URL;
    const token = process.env.WEB_REVALIDATE_TOKEN;
    if (!url || !token || !slug) return;

    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidate-token': token,
      },
      body: JSON.stringify({ slug, type: 'software' }),
    }).catch(() => {});
  }
}
