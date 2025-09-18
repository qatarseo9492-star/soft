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
exports.UploadsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const fs = require("fs");
const path = require("path");
const config_1 = require("@nestjs/config");
function safeSlug(s) {
    return (s || '').toLowerCase().replace(/[^a-z0-9\-]+/g, '-').replace(/^\-+|\-+$/g, '');
}
let UploadsController = class UploadsController {
    constructor(cfg) {
        this.cfg = cfg;
    }
    async upload(file, body) {
        if (!file)
            throw new common_1.BadRequestException('No image uploaded');
        const slug = safeSlug(body.softwareSlug || 'misc');
        const publicBase = process.env.PUBLIC_UPLOAD_BASE;
        const url = `${publicBase}/software/${slug}/${file.filename}`;
        return { ok: true, url };
    }
};
exports.UploadsController = UploadsController;
__decorate([
    (0, common_1.Post)('image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, _file, cb) => {
                const base = process.env.UPLOAD_DIR;
                const slug = safeSlug(req.body.softwareSlug || 'misc');
                const dest = path.join(base, 'software', slug);
                fs.mkdirSync(dest, { recursive: true });
                cb(null, dest);
            },
            filename: (_req, file, cb) => {
                const ts = Date.now();
                const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
                cb(null, `${ts}${ext}`);
            }
        }),
        limits: { fileSize: Number(process.env.MAX_IMAGE_MB || 8) * 1024 * 1024 }
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "upload", null);
exports.UploadsController = UploadsController = __decorate([
    (0, common_1.Controller)('/v1/uploads'),
    __metadata("design:paramtypes", [config_1.ConfigService])
], UploadsController);
