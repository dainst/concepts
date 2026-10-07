import {inject, Pipe, PipeTransform} from '@angular/core';
import {TitleService} from '../services/title.service';
import {ConceptId} from 'concepts-common/interfaces/concept';
import {map, Observable, of} from 'rxjs';
import {stringifyId} from 'concepts-common/functions/concept-id';

@Pipe({
  name: 'title'
})
export class TitlePipe implements PipeTransform {
  private readonly ts = inject(TitleService);
  transform(cId: ConceptId): Observable<string> {
    if (cId.type === 'url')
      return of(decodeURIComponent(cId.id).replaceAll('&#39;',"'"));
    return this.ts.get$(cId)
      .pipe(map(c => c.title || stringifyId(c.id)));
  }
}
