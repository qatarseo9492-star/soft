import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async get(key: string) {
    const s = await this.prisma.setting.findUnique({ where: { key } });
    return s ?? null;
  }

  async list() {
    const rows = await this.prisma.setting.findMany({ orderBy: { key: 'asc' } });
    return { ok: true, items: rows };
  }

  async put(key: string, body: { json?: unknown; text?: string | null }) {
    // JSON column semantics:
    //   undefined -> SQL NULL (DbNull)
    //   null      -> JSON null (JsonNull)
    //   value     -> stored as JSON
    const jsonValue:
      | Prisma.NullableJsonNullValueInput
      | Prisma.InputJsonValue
      | undefined =
      body.json === undefined
        ? Prisma.DbNull
        : body.json === null
        ? Prisma.JsonNull
        : (body.json as Prisma.InputJsonValue);

    const res = await this.prisma.setting.upsert({
      where: { key },
      create: { key, json: jsonValue, text: body.text ?? null },
      update: { json: jsonValue, text: body.text ?? null },
    });
    return { ok: true, setting: res };
  }

  async del(key: string) {
    await this.prisma.setting.delete({ where: { key } }).catch(() => null);
    return { ok: true };
  }
}