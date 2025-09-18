import { Controller, Get, Query, Patch, Param, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { Role, CommentStatus } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MODERATOR)
@Controller('comments')
export class CommentsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(
    @Query('status') status?: CommentStatus, // PENDING | APPROVED | SPAM | DELETED
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
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

  @Patch(':id/approve')
  async approve(@Param('id') id: string) {
    return this.prisma.comment.update({
      where: { id },
      data: { status: CommentStatus.APPROVED },
    });
  }

  @Patch(':id/spam')
  async spam(@Param('id') id: string) {
    return this.prisma.comment.update({
      where: { id },
      data: { status: CommentStatus.SPAM },
    });
  }

  @Patch(':id/delete')
  async softDelete(@Param('id') id: string) {
    return this.prisma.comment.update({
      where: { id },
      data: { status: CommentStatus.DELETED },
    });
  }
}
