import {inject, Service} from '@angular/core';
import {Concept, ConceptId} from 'concepts-common/interfaces/concept';
import {BehaviorSubject, map, Observable, Subscription} from 'rxjs';
import {stringifyId} from 'concepts-common/functions/concept-id';
import {BackendService} from './backend.service';

// TODO: merge this with language service and the similar functionality from graph and timeline

@Service()
export class TitleService {
  private bs = inject(BackendService);

  private readonly cache: {
    [type: string]: {
      [id: string]: {
        value$: BehaviorSubject<Concept>;
        request?: Subscription;
      }
    }
  } = {};

  get$(conceptId: ConceptId): Observable<Concept> {
    this.cache[conceptId.type] ??= {};

    const existing = this.cache[conceptId.type][conceptId.id];

    if (existing) {
      return existing.value$.asObservable();
    }

    const value$ = new BehaviorSubject<Concept>({
      id: conceptId,
      title: stringifyId(conceptId) + ' (…)',
      domain: 'unknown'
    });

    const request = this.bs
      .search({...conceptId, shards: ['title']})
      .pipe(map(res => {
        if (res.count === 0) return <Concept>{id: conceptId, title: stringifyId(conceptId) + ' (!)'};
        if (res.count > 1) throw new Error('something went wrong');
        return res.results[0];
      }))
      .subscribe(value => value$.next(value));

    this.cache[conceptId.type][conceptId.id] = {
      value$,
      request
    };

    return value$.asObservable();
  }

  set(concept: Concept): void {
    // TODO check if title is actually there
    this.cache[concept.id.type] ??= {};

    const existing = this.cache[concept.id.type][concept.id.id];

    if (existing) {
      existing.request?.unsubscribe();
      existing.request = undefined;
      existing.value$.next(concept);
      return;
    }

    const value$ = new BehaviorSubject<Concept>(concept);

    this.cache[concept.id.type][concept.id.id] = {
      value$
    };
  }
}
