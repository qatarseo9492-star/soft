import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SoftwareService } from './software.service';
import { SoftwareController } from './software.controller';

@Module({
  imports: [PrismaModule],
  providers: [SoftwareService],
  controllers: [SoftwareController],
  exports: [SoftwareService],
})
export class SoftwareModule {}
