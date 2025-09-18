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
const prisma_service_1 = require("../prisma.service");
let SoftwareService = class SoftwareService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(params) {
        const { q, category, os, license, sort, limit, page } = params;
        const where = {};
        if (q) {
            where.OR = [
                { name: { contains: q } },
                { shortDesc: { contains: q } },
                { longDesc: { contains: q } },
                { vendor: { name: { contains: q } } },
                { tags: { some: { name: { contains: q } } } },
            ];
        }
        if (license)
            where.license = { equals: license };
        if (os)
            where.os = { equals: [os] };
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
        let orderBy = { updatedAt: 'desc' };
        if (sort === 'new')
            orderBy = { createdAt: 'desc' };
        if (sort === 'downloads')
            orderBy = { counter: { total: 'desc' } };
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
            os: s.os ?? [],
            license: s.license ?? null,
            updatedAt: s.updatedAt,
            heroImage: s.heroUrl ?? null,
        }));
        return { ok: true, total, page, limit, items: normalized };
    }
    async detail(slug) {
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
        if (!s)
            return null;
        return {
            ok: true,
            software: {
                id: s.id,
                slug: s.slug,
                name: s.name,
                description: s.longDesc,
                homepage: s.homepage,
                license: s.license,
                os: s.os ?? [],
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
    async logDownload(args) {
        const sw = await this.prisma.software.findUnique({
            where: { slug: args.slug },
            select: { id: true },
        });
        if (!sw)
            return null;
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
};
exports.SoftwareService = SoftwareService;
exports.SoftwareService = SoftwareService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SoftwareService);
