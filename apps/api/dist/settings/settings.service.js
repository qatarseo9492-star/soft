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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma.service");
let SettingsService = class SettingsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async get(key) {
        const s = await this.prisma.setting.findUnique({ where: { key } });
        return s ?? null;
    }
    async list() {
        const rows = await this.prisma.setting.findMany({ orderBy: { key: 'asc' } });
        return { ok: true, items: rows };
    }
    async put(key, body) {
        const jsonValue = body.json === undefined
            ? client_1.Prisma.DbNull
            : body.json === null
                ? client_1.Prisma.JsonNull
                : body.json;
        const res = await this.prisma.setting.upsert({
            where: { key },
            create: { key, json: jsonValue, text: body.text ?? null },
            update: { json: jsonValue, text: body.text ?? null },
        });
        return { ok: true, setting: res };
    }
    async del(key) {
        await this.prisma.setting.delete({ where: { key } }).catch(() => null);
        return { ok: true };
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsService);
