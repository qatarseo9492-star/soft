import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('v1/admin/settings')
export class SettingsController {
  constructor(private readonly svc: SettingsService) {}

  // GET /v1/admin/settings
  @Get()
  list() {
    return this.svc.list();
  }

  // PUT /v1/admin/settings/:key
  @Put(':key')
  put(@Param('key') key: string, @Body() body: any) {
    return this.svc.put(key, body);
  }

  // DELETE /v1/admin/settings/:key
  @Delete(':key')
  del(@Param('key') key: string) {
    return this.svc.del(key);
  }
}