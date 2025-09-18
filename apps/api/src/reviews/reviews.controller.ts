import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('v1/reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReviewsController {
  constructor(private prisma: PrismaService) {}

  // Create/update the current user's review for a software
  @Post(':softwareId')
  async upsert(
    @Param('softwareId') softwareId: string,
    @Body() body: { rating: number; title?: string; body?: string },
    // @Req() req any user object provided by your JWT strategy
  ) {
    // In your real code, read user id from req.user.id
    // For safety here, expect body.userId (or integrate Jwt strategy)
    const userId = (body as any).userId;
    const rating = Math.max(1, Math.min(5, Math.floor(body.rating || 0)));

    const review = await this.prisma.review.upsert({
      where: { softwareId_userId: { softwareId, userId } },
      create: { softwareId, userId, rating, title: body.title, body: body.body },
      update: { rating, title: body.title, body: body.body },
    });

    // Recalculate aggregates
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

  // List reviews for a software
  @Get(':softwareId')
  list(
    @Param('softwareId') softwareId: string,
    @Query('skip') skip = '0',
    @Query('take') take = '20',
  ) {
    return this.prisma.review.findMany({
      where: { softwareId },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
      skip: +skip, take: +take,
    });
  }
}
