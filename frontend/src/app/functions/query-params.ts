import {HttpParams} from '@angular/common/http';
import {ConceptSelector} from 'concepts-common/src/interfaces/selector';

export const searchToHttpParams = (searchQuery: ConceptSelector): HttpParams =>
  Object.entries(searchQuery)
    .filter(([k, v]) => ['string', 'number', 'boolean'].includes(typeof v))
    .reduce(((params, entry) => params.set(...entry)), new HttpParams());
