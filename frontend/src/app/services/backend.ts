import {Service, inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Concept} from 'concepts-common/src/interfaces/concept';

@Service()
export class Backend {
  private readonly http = inject(HttpClient);
  private readonly api = 'http://localhost:3000/'

  getConcept(type: string, id: string): Observable<Concept> {
    return this.http.get<Concept>(this.api + `concept/${type}/${id}`);
  }
}
