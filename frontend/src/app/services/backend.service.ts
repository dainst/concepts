import {Service, inject, isDevMode} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable, retry, timer} from 'rxjs';
import {Concept, ConceptId} from 'concepts-common/interfaces/concept';
import {ConceptSelector, SearchResult} from 'concepts-common/interfaces/search';
import {searchToHttpParams} from '../functions/query-params';
import {ConceptHistory} from 'concepts-common/interfaces/concept-history';
import {RetryConfig} from 'rxjs/internal/operators/retry';
import {isConceptId} from 'concepts-common/functions/concept.typeguards';
import {Status} from 'concepts-common/interfaces/default';
import {User} from 'concepts-common/interfaces/user';

@Service()
export class BackendService {
  private readonly http = inject(HttpClient);
  private readonly api = isDevMode()
    ? 'http://localhost:3000/'
    : '/api/';

  static retryConfig: RetryConfig = {
    count: Infinity, // TODO change this in PROD
    delay: error=> {
      if (error.status >= 500) {
        return timer(5000);
      }
      throw error;
    }
  };

  getConcept(type: string, id: string): Observable<Concept> {
    return this.http.get<Concept>(this.api + `concept/${type}/${id}`)
      .pipe(retry(BackendService.retryConfig));
  }

  search(searchQuery: ConceptSelector): Observable<SearchResult> {
    return this.http.get<SearchResult>(this.api + `search`, {params: searchToHttpParams(searchQuery)})
      .pipe(retry(BackendService.retryConfig));
  }

  getHistory(type: string, id: string): Observable<ConceptHistory> {
    return this.http.get<ConceptHistory>(this.api + `history/${type}/${id}`)
      .pipe(retry(BackendService.retryConfig));
  }

  getStatus(): Observable<Status> {
    return this.http.get<Status>(this.api);
  }

  upcertConcept(concept: Concept): Observable<{new: boolean, id: ConceptId}> {
    return this.http.post<ConceptId>(this.api + `concept`, concept, {observe: 'response'})
      .pipe(map(res => {
        if (![200, 201].includes(res.status)) throw new Error(`Invalid response code: ${res.status}`);
        const cId = res.body;
        if (!isConceptId(cId)) throw new Error(`Invalid response: ${JSON.stringify(cId)}`);
        return {
          new: res.status === 201,
          id: cId
        };
      }));
  }

  getUser(): Observable<User|null> {
    return this.http.get<User|null>(this.api + `user`);
  }
}
