import {HttpParams} from '@angular/common/http';
import {ConceptSelector} from 'concepts-common/interfaces/search';

const parametrize = (k: string, v: any, prefix: string = ''): [string, string][] => {
  switch (typeof v) {
    case "bigint":
    case "string":
    case "boolean":
    case "number":
      return [[`${prefix}${k}`, String(v)]];
    case "object":
      if (Array.isArray(v)) {
        return v
          .flatMap(e => parametrize(`${prefix}${k}`, e));
      }
      if (v == null) {
        return [[`${prefix}${k}`, 'null']];
      }
      return Object
        .entries(v)
        .map(([ok, ov]) => parametrize(`${prefix}${ok}`, ov, `${k}.`))
        .flat();
    case "function":
    case "symbol":
      throw new Error(`could not serialize ${v}`);
    case "undefined":
    default:
      return [];
  }
}

export const searchToHttpParams = (searchQuery: ConceptSelector): HttpParams =>
  Object.entries(searchQuery)
    .flatMap(([k, v]) => parametrize(k, v))
    .reduce(
      ((params, entry) => params.append(...entry)),
      new HttpParams()
    );
