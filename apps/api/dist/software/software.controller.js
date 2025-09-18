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
let SoftwareController = class SoftwareController {
    constructor(svc) {
        this.svc = svc;
    }
    async list(q) {
        const limit = Number.parseInt(q.limit ?? '24', 10);
        const page = Number.parseInt(q.page ?? '1', 10);
        const sort = q.sort ?? 'updated';
        const safe = {
            q: q.q || undefined,
            category: q.category || undefined,
            os: q.os || undefined,
            license: q.license || undefined,
            sort,
            limit: Number.isFinite(limit) && limit > 0 && limit <= 100 ? limit : 24,
            page: Number.isFinite(page) && page > 0 && page <= 1000 ? page : 1,
        };
        return this.svc.list(safe);
    }
    async detail(slug) {
        const out = await this.svc.detail(slug);
        if (!out)
            return { ok: false, error: 'not_found' };
        return out;
    }
};
exports.SoftwareController = SoftwareController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SoftwareController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SoftwareController.prototype, "detail", null);
exports.SoftwareController = SoftwareController = __decorate([
    (0, common_1.Controller)('v1/software'),
    __metadata("design:paramtypes", [software_service_1.SoftwareService])
], SoftwareController);
