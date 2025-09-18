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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoftwareController = void 0;
const common_1 = require("@nestjs/common");
const software_service_1 = require("./software.service");
const public_decorator_1 = require("../auth/public.decorator");
const AllowedSorts = ['updated', 'new', 'rating', 'name', 'downloads'];
function toInt(value, fallback, min = 1, max = 100) {
    const n = Number(value);
    if (!Number.isFinite(n))
        return fallback;
    return Math.min(Math.max(Math.trunc(n), min), max);
}
let SoftwareController = class SoftwareController {
    constructor(svc) {
        this.svc = svc;
    }
    async list(q, category, vendor, tag, os, license, badge, status, sort, page = '1', limit = '20') {
        const sortKey = AllowedSorts.includes(String(sort))
            ? sort
            : undefined;
        return this.svc.list({
            q,
            category,
            vendor,
            tag,
            os,
            license,
            badge,
            status,
            sort: sortKey,
            page: toInt(page, 1, 1, 10_000),
            limit: toInt(limit, 20, 1, 100),
        });
    }
    async getBySlug(slug) {
        return this.svc.getBySlug(slug);
    }
    async create(dto) {
        return this.svc.create(dto);
    }
    async update(id, dto) {
        return this.svc.update(id, dto);
    }
    async addVersion(softwareId, dto) {
        return this.svc.addVersion(softwareId, dto);
    }
    async addBuild(versionId, dto) {
        return this.svc.addBuild(versionId, dto);
    }
    async bulkStatus(body) {
        return this.svc.bulkUpdateStatus(body.ids, body.status);
    }
    async bulkBadge(body) {
        return this.svc.bulkToggleBadge(body.ids, body.badge, body.value);
    }
    async bulkDelete(body) {
        return this.svc.bulkDelete(body.ids);
    }
};
exports.SoftwareController = SoftwareController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('vendor')),
    __param(3, (0, common_1.Query)('tag')),
    __param(4, (0, common_1.Query)('os')),
    __param(5, (0, common_1.Query)('license')),
    __param(6, (0, common_1.Query)('badge')),
    __param(7, (0, common_1.Query)('status')),
    __param(8, (0, common_1.Query)('sort')),
    __param(9, (0, common_1.Query)('page')),
    __param(10, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], SoftwareController.prototype, "list", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SoftwareController.prototype, "getBySlug", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SoftwareController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SoftwareController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/version'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SoftwareController.prototype, "addVersion", null);
__decorate([
    (0, common_1.Post)('version/:versionId/build'),
    __param(0, (0, common_1.Param)('versionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SoftwareController.prototype, "addBuild", null);
__decorate([
    (0, common_1.Post)('bulk/status'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SoftwareController.prototype, "bulkStatus", null);
__decorate([
    (0, common_1.Post)('bulk/badge'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SoftwareController.prototype, "bulkBadge", null);
__decorate([
    (0, common_1.Delete)('bulk'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SoftwareController.prototype, "bulkDelete", null);
exports.SoftwareController = SoftwareController = __decorate([
    (0, common_1.Controller)('v1/software'),
    __metadata("design:paramtypes", [software_service_1.SoftwareService])
], SoftwareController);
