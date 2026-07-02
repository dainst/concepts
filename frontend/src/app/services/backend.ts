import {Service, inject} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable, retry, timer} from 'rxjs';
import {Concept, ConceptAbstract} from 'concepts-common/src/interfaces/concept';
import {ConceptSelector} from 'concepts-common/src/interfaces/select';

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

  search(selector: ConceptSelector): Observable<ConceptAbstract[]> {
    const params = Object.entries(selector)
      .filter(([k, v]) => ['string', 'number', 'boolean'].includes(typeof v))
      .reduce(((params, entry) => params.set(...entry)), new HttpParams());
    console.log(params)
    return this.http.get<ConceptAbstract[]>(this.api + `search`, {params})
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
