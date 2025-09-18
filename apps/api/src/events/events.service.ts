import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class EventsService {
  private subject = new Subject<unknown>();

  emit(data: unknown) {
    this.subject.next(data);
  }

  stream$(): Observable<unknown> {
    return this.subject.asObservable();
  }
}