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
exports.CommentsController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_guard_1 = require("../auth/jwt.guard");
const roles_guard_1 = require("../auth/roles.guard");
const client_1 = require("@prisma/client");
let CommentsController = class CommentsController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(status, page = '1', limit = '20') {
        const take = Math.min(100, Math.max(1, Number(limit) || 20));
        const skip = Math.max(0, (Math.max(1, Number(page) || 1) - 1) * take);
        const where = {
            ...(status ? { status } : {}),
        };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.comment.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                include: {
                    software: { select: { id: true, name: true, slug: true } },
                    user: { select: { id: true, email: true, name: true } },
                },
                skip,
                take,
            }),
            this.prisma.comment.count({ where }),
        ]);
        return { items, total, page: Number(page), pages: Math.ceil(total / take) };
    }
    async approve(id) {
        return this.prisma.comment.update({
            where: { id },
            data: { status: client_1.CommentStatus.APPROVED },
        });
    }
    async spam(id) {
        return this.prisma.comment.update({
            where: { id },
            data: { status: client_1.CommentStatus.SPAM },
        });
    }
    async softDelete(id) {
        return this.prisma.comment.update({
            where: { id },
            data: { status: client_1.CommentStatus.DELETED },
        });
    }
};
exports.CommentsController = CommentsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "list", null);
__decorate([
    (0, common_1.Patch)(':id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "approve", null);
__decorate([
    (0, common_1.Patch)(':id/spam'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "spam", null);
__decorate([
    (0, common_1.Patch)(':id/delete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "softDelete", null);
exports.CommentsController = CommentsController = __decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_guard_1.Roles)(client_1.Role.ADMIN, client_1.Role.MODERATOR),
    (0, common_1.Controller)('comments'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CommentsController);
