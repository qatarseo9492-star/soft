"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoftwareService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const sluggify = (s) => String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
const badgeColumn = {
    latest: 'isLatest',
    updated: 'isUpdated',
    recommended: 'isRecommended',
    new: 'isNew',
};
let SoftwareService = class SoftwareService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getBySlug(slug) {
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
                    where: { status: client_1.CommentStatus.APPROVED },
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                },
            },
        });
        if (!software)
            throw new common_1.NotFoundException('Software not found');
        return software;
    }
    async list({ q, category, vendor, tag, os, license, badge, status, sort = 'updated', page = 1, limit = 20, }) {
        const where = {};
        if (status)
            where.status = status;
        const term = q?.trim();
        if (term) {
            where.OR = [
                { name: { contains: term } },
                { shortDesc: { contains: term } },
                { longDesc: { contains: term } },
            ];
        }
        if (category)
            where.category = { is: { slug: category } };
        if (vendor)
            where.vendor = { is: { slug: vendor } };
        if (tag)
            where.tags = { some: { slug: tag } };
        if (os || license) {
            where.versions = {
                some: {
                    ...(os ? { os: os } : {}),
                    ...(license ? { license: license } : {}),
                },
            };
        }
        if (badge) {
            const col = badgeColumn[badge];
            where[col] = true;
        }
        const orderBy = sort === 'new'
            ? { createdAt: 'desc' }
            : sort === 'rating'
                ? { ratingsAvg: 'desc' }
                : sort === 'name'
                    ? { name: 'asc' }
                    : sort === 'downloads'
                        ? { downloads: { _count: 'desc' } }
                        : { lastUpdatedAt: 'desc' };
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
    async create(dto) {
        if (!dto)
            throw new common_1.BadRequestException('Body is required');
        const { name, title, slug, status, shortDescription, description, shortDesc, longDesc, tags, media, versions, categorySlug, vendorSlug, ...rest } = dto;
        const nameVal = name ?? title;
        if (!nameVal || !String(nameVal).trim()) {
            throw new common_1.BadRequestException('Field "name" is required');
        }
        const computedSlug = slug || sluggify(nameVal);
        const shortDescVal = (shortDescription ?? shortDesc) ?? '';
        const longDescVal = (description ?? longDesc) ?? '';
        const [category, vendor] = await Promise.all([
            categorySlug ? this.prisma.category.findUnique({ where: { slug: categorySlug } }) : null,
            vendorSlug ? this.prisma.vendor.findUnique({ where: { slug: vendorSlug } }) : null,
        ]);
        if (categorySlug && !category) {
            throw new common_1.BadRequestException(`Category not found: ${categorySlug}`);
        }
        if (vendorSlug && !vendor) {
            throw new common_1.BadRequestException(`Vendor not found: ${vendorSlug}`);
        }
        const base = {
            ...(rest || {}),
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
            base.media = { create: media.map((m) => ({ ...m })) };
        }
        if (Array.isArray(tags) && tags.length) {
            base.tags = {
                connectOrCreate: tags.map((t) => {
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
                create: versions.map((v) => ({
                    ...v,
                    ...(Array.isArray(v?.builds) && v.builds.length
                        ? { builds: { create: v.builds.map((b) => ({ ...b })) } }
                        : {}),
                })),
            };
        }
        const created = await this.prisma.software.create({
            data: base,
            include: {
                category: true,
                vendor: true,
                tags: true,
            },
        });
        await this.revalidate(created.slug);
        return created;
    }
    async update(id, dto) {
        if (!id)
            throw new common_1.BadRequestException('Missing id');
        if (!dto)
            throw new common_1.BadRequestException('Body is required');
        const { name, title, slug, status, shortDescription, description, shortDesc, longDesc, tags, ...rest } = dto;
        const data = {
            ...rest,
            lastUpdatedAt: new Date(),
        };
        if (name || title)
            data.name = (name ?? title);
        if (slug)
            data.slug = slug;
        if (status)
            data.status = status;
        if (shortDescription || shortDesc)
            data.shortDesc = (shortDescription ?? shortDesc);
        if (description || longDesc)
            data.longDesc = (description ?? longDesc);
        const updated = await this.prisma.software.update({
            where: { id },
            data,
        });
        if (Array.isArray(tags)) {
            await this.prisma.software.update({
                where: { id },
                data: { tags: { set: [] } },
            });
            if (tags.length) {
                await this.prisma.software.update({
                    where: { id },
                    data: {
                        tags: {
                            connectOrCreate: tags.map((t) => {
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
        const fresh = await this.prisma.software.findUnique({
            where: { id },
            select: { slug: true },
        });
        if (fresh?.slug)
            await this.revalidate(fresh.slug);
        return updated;
    }
    async addVersion(softwareId, dto) {
        const v = await this.prisma.softwareVersion.create({
            data: {
                ...dto,
                softwareId,
                ...(Array.isArray(dto?.builds) && dto.builds.length
                    ? { builds: { create: dto.builds.map((b) => ({ ...b })) } }
                    : {}),
            },
            include: { builds: true },
        });
        const s = await this.prisma.software.update({
            where: { id: softwareId },
            data: { lastUpdatedAt: new Date(), isUpdated: true },
            select: { slug: true },
        });
        if (s.slug)
            await this.revalidate(s.slug);
        return v;
    }
    async addBuild(versionId, dto) {
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
            if (version.software?.slug)
                await this.revalidate(version.software.slug);
        }
        return build;
    }
    async addMedia(softwareId, dto) {
        const media = await this.prisma.softwareMedia.create({
            data: { ...dto, softwareId },
        });
        const s = await this.prisma.software.update({
            where: { id: softwareId },
            data: { lastUpdatedAt: new Date() },
            select: { slug: true },
        });
        if (s.slug)
            await this.revalidate(s.slug);
        return media;
    }
    async bulkUpdateStatus(ids, status) {
        if (!Array.isArray(ids) || !ids.length)
            return { count: 0 };
        const result = await this.prisma.software.updateMany({
            where: { id: { in: ids } },
            data: { status: status, lastUpdatedAt: new Date() },
        });
        return { count: result.count };
    }
    async bulkToggleBadge(ids, badge, value) {
        if (!Array.isArray(ids) || !ids.length)
            return { count: 0 };
        const data = {};
        data[badgeColumn[badge]] = value;
        const result = await this.prisma.software.updateMany({
            where: { id: { in: ids } },
            data,
        });
        return { count: result.count };
    }
    async bulkDelete(ids) {
        if (!Array.isArray(ids) || !ids.length)
            return { count: 0 };
        const result = await this.prisma.software.deleteMany({
            where: { id: { in: ids } },
        });
        return { count: result.count };
    }
    async revalidate(slug) {
        const url = process.env.WEB_REVALIDATE_URL;
        const token = process.env.WEB_REVALIDATE_TOKEN;
        if (!url || !token || !slug)
            return;
        await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-revalidate-token': token,
            },
            body: JSON.stringify({ slug, type: 'software' }),
        }).catch(() => { });
    }
};
exports.SoftwareService = SoftwareService;
exports.SoftwareService = SoftwareService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SoftwareService);
