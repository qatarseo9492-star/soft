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
exports.ReviewsController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_guard_1 = require("../auth/jwt.guard");
const roles_guard_1 = require("../auth/roles.guard");
let ReviewsController = class ReviewsController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async upsert(softwareId, body) {
        const userId = body.userId;
        const rating = Math.max(1, Math.min(5, Math.floor(body.rating || 0)));
        const review = await this.prisma.review.upsert({
            where: { softwareId_userId: { softwareId, userId } },
            create: { softwareId, userId, rating, title: body.title, body: body.body },
            update: { rating, title: body.title, body: body.body },
        });
        const agg = await this.prisma.review.aggregate({
            where: { softwareId },
            _avg: { rating: true },
            _count: { rating: true },
        });
        await this.prisma.software.update({
            where: { id: softwareId },
            data: { ratingsAvg: agg._avg.rating || 0, ratingsCount: agg._count.rating || 0 }
        });
        return review;
    }
    list(softwareId, skip = '0', take = '20') {
        return this.prisma.review.findMany({
            where: { softwareId },
            include: { user: { select: { id: true, name: true, avatarUrl: true } } },
            orderBy: { createdAt: 'desc' },
            skip: +skip, take: +take,
        });
    }
};
exports.ReviewsController = ReviewsController;
__decorate([
    (0, common_1.Post)(':softwareId'),
    __param(0, (0, common_1.Param)('softwareId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "upsert", null);
__decorate([
    (0, common_1.Get)(':softwareId'),
    __param(0, (0, common_1.Param)('softwareId')),
    __param(1, (0, common_1.Query)('skip')),
    __param(2, (0, common_1.Query)('take')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "list", null);
exports.ReviewsController = ReviewsController = __decorate([
    (0, common_1.Controller)('v1/reviews'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReviewsController);
