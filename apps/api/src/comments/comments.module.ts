import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CommentsController } from './comments.controller';

@Module({
  imports: [PrismaModule],   // <-- important
  controllers: [CommentsController],
})
export class CommentsModule {}
