import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class StatsService implements OnModuleInit {
  constructor(private prisma: PrismaClient) {}

  onModuleInit() {
    // refresh at start and then hourly
    this.refresh30d().catch(() => {});
    setInterval(() => this.refresh30d().catch(() => {}), 60 * 60 * 1000);
  }

  async refresh30d() {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    // Aggregate 30-day counts per software
    const rows = await this.prisma.downloadLog.groupBy({
      by: ['softwareId'],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    });

    // Upsert all
    for (const r of rows) {
      await this.prisma.downloadCounter30d.upsert({
        where: { softwareId: r.softwareId },
        create: { softwareId: r.softwareId, total30d: r._count._all, computedAt: new Date() },
        update: { total30d: r._count._all, computedAt: new Date() },
      });
    }
  }
}
