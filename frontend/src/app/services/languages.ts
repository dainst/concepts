import {inject, Service} from '@angular/core';
import {Backend} from './backend';
import {map, Observable, shareReplay, take} from 'rxjs';
import {Concept} from 'concepts-common/interfaces/concept';

@Service()
export class LanguagesService {
  readonly bs = inject(Backend);
  public readonly languages$: Observable<Concept[]>;
  constructor() {
    this.languages$ = this.bs.search({type: 'language', shards: ['title'], limit: 300, forceCache: true})
      .pipe(
        map(sr => sr.results),
        take(1),
        shareReplay({bufferSize: 1, refCount: false})
      );
  }
}
