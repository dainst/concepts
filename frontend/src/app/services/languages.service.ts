import {inject, Service} from '@angular/core';
import {BackendService} from './backend.service';
import {catchError, EMPTY, map, Observable, shareReplay, take} from 'rxjs';
import {Concept} from 'concepts-common/interfaces/concept';
import {MessageService} from './message.service';
import {GlobalErrorHandler} from '../global-error-handler';

@Service()
export class LanguagesService {
  readonly bs = inject(BackendService);
  readonly ms = inject(MessageService);
  public readonly languages$: Observable<Concept[]>;
  constructor() {
    this.languages$ = this.bs.search({type: 'language', shards: ['title'], limit: 300, forceCache: true})
      .pipe(
        catchError(err => {
          this.ms.add(GlobalErrorHandler.convertError(err)); // to avoid duplication fo error if thrown
          return EMPTY;
        }),
        map(sr => sr.results),
        take(1),
        shareReplay({bufferSize: 1, refCount: false})
      );
  }
}
