import { Module } from '@nestjs/common';
import { EventsModule } from './events/events.module';
import { SettingsModule } from './settings/settings.module';
import { SoftwareModule } from './software/software.module';

@Module({
  imports: [EventsModule, SettingsModule, SoftwareModule],
})
export class AppModule {}