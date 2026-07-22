import {Service, inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, retry, timer} from 'rxjs';
import {Concept} from 'concepts-common/interfaces/concept';
import {ConceptSelector, SearchResult} from 'concepts-common/interfaces/search';
import {searchToHttpParams} from '../functions/query-params';

@Service()
export class Backend {
  private readonly http = inject(HttpClient);
  private readonly api = 'http://localhost:3000/'

  getConcept(type: string, id: string): Observable<Concept> {
    return this.http.get<Concept>(this.api + `concept/${type}/${id}`)
      .pipe(
        retry({
          count: Infinity, // TODO change this in PROD
          delay: error=> {
            if (error.status >= 500) {
              console.error(error);
              // TODO collect error
              return timer(5000);
            }
            throw error;
          }
        })
      );
  }

  search(searchQuery: ConceptSelector): Observable<SearchResult> {
    return this.http.get<SearchResult>(this.api + `search`, {params: searchToHttpParams(searchQuery)})
      .pipe(
        retry({
          count: Infinity, // TODO change this in PROD
          delay: error=> {
            if (error.status >= 500) {
              console.error(error);
              // TODO collect error
              return timer(5000);
            }
            throw error;
          }
        })
      );
  }
}
