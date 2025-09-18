import { Controller, Get, Param, Query } from '@nestjs/common';
import { SoftwareService } from './software.service';

@Controller('v1/software')
export class SoftwareController {
  constructor(private readonly svc: SoftwareService) {}

  // GET /v1/software?q=&category=&os=&license=&sort=&limit=&page=
  @Get()
  async list(@Query() q: any) {
    // parse + defaults
    const limit = Number.parseInt(q.limit ?? '24', 10);
    const page  = Number.parseInt(q.page  ?? '1', 10);
    const sort  = (q.sort as 'updated' | 'new' | 'downloads' | undefined) ?? 'updated';

    const safe = {
      q: (q.q as string | undefined) || undefined,
      category: (q.category as string | undefined) || undefined,
      os: (q.os as string | undefined) || undefined,
      license: (q.license as string | undefined) || undefined,
      sort,
      limit: Number.isFinite(limit) && limit > 0 && limit <= 100 ? limit : 24,
      page:  Number.isFinite(page)  && page  > 0 && page  <= 1000 ? page  : 1,
    };

    return this.svc.list(safe);
  }

  // GET /v1/software/:slug
  @Get(':slug')
  async detail(@Param('slug') slug: string) {
    const out = await this.svc.detail(slug);
    if (!out) return { ok: false, error: 'not_found' };
    return out;
  }
}