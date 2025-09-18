// src/software/software.controller.ts
import {
  Controller,
  Get,
  Param,
  Query,
  Post,
  Put,
  Body,
  Delete,
} from '@nestjs/common';
import { SoftwareService } from './software.service';
import { Public } from '../auth/public.decorator';

const AllowedSorts = ['updated', 'new', 'rating', 'name', 'downloads'] as const;
type SortKey = (typeof AllowedSorts)[number];

function toInt(value: string | undefined, fallback: number, min = 1, max = 100) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(Math.trunc(n), min), max);
}

@Controller('v1/software')
export class SoftwareController {
  constructor(private readonly svc: SoftwareService) {}

  @Public()
  @Get()
  async list(
    @Query('q') q?: string,
    @Query('category') category?: string,
    @Query('vendor') vendor?: string,
    @Query('tag') tag?: string,
    @Query('os') os?: string,
    @Query('license') license?: string,
    @Query('badge') badge?: 'latest' | 'updated' | 'recommended' | 'new',
    @Query('status') status?: string,
    @Query('sort') sort?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const sortKey: SortKey | undefined = (AllowedSorts as readonly string[]).includes(
      String(sort),
    )
      ? (sort as SortKey)
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

  @Public()
  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.svc.getBySlug(slug);
  }

  @Post()
  async create(@Body() dto: any) {
    return this.svc.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.svc.update(id, dto);
  }

  @Post(':id/version')
  async addVersion(@Param('id') softwareId: string, @Body() dto: any) {
    return this.svc.addVersion(softwareId, dto);
  }

  @Post('version/:versionId/build')
  async addBuild(@Param('versionId') versionId: string, @Body() dto: any) {
    return this.svc.addBuild(versionId, dto);
  }

  // --- Bulk helpers ---

  @Post('bulk/status')
  async bulkStatus(@Body() body: { ids: string[]; status: string }) {
    return this.svc.bulkUpdateStatus(body.ids, body.status);
  }

  @Post('bulk/badge')
  async bulkBadge(
    @Body()
    body: {
      ids: string[];
      badge: 'latest' | 'updated' | 'recommended' | 'new';
      value: boolean;
    },
  ) {
    return this.svc.bulkToggleBadge(body.ids, body.badge, body.value);
  }

  @Delete('bulk')
  async bulkDelete(@Body() body: { ids: string[] }) {
    return this.svc.bulkDelete(body.ids);
  }
}
