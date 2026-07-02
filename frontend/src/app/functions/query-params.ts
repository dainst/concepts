import {SearchQuery} from 'concepts-common/src/interfaces/search';
import {HttpParams} from '@angular/common/http';

export const searchToHttpParams = (searchQuery: SearchQuery): HttpParams =>
  Object.entries(searchQuery.selector)
    .filter(([k, v]) => ['string', 'number', 'boolean'].includes(typeof v))
    .reduce(((params, entry) => params.set(...entry)), new HttpParams())
    .set('limit', searchQuery.limit)
    .set('offset', searchQuery.offset);
