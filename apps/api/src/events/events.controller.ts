import { Controller, Sse } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { EventsService } from './events.service';

type SSEMessage = MessageEvent | { data: unknown };

@Controller('v1/events')
export class EventsController {
  constructor(private readonly eventsSvc: EventsService) {}

  @Sse()
  stream(): Observable<SSEMessage> {
    return this.eventsSvc.stream$().pipe(map((data) => ({ data })));
  }
}