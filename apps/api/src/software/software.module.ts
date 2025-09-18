import { Module } from '@nestjs/common';
import { SoftwareController } from './software.controller';
import { SoftwareService } from './software.service';
import { PrismaService } from '../prisma.service';
// It's fine to keep EventsModule imported, but not required anymore.
// import { EventsModule } from '../events/events.module';

@Module({
  // imports: [EventsModule],
  controllers: [SoftwareController],
  providers: [SoftwareService, PrismaService],
  exports: [SoftwareService],
})
export class SoftwareModule {}