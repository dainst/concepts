import {HttpParams} from '@angular/common/http';
import {ConceptSelector} from 'concepts-common/interfaces/search';
import {ParamMap} from '@angular/router';

const parametrize = (k: string, v: unknown, prefix: string = ''): [string, string][] => {
  switch (typeof v) {
    case 'bigint':
    case 'string':
    case 'boolean':
    case 'number':
      return [[`${prefix}${k}`, String(v)]];
    case 'object':
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
    case 'function':
    case 'symbol':
      throw new Error(`could not serialize ${v.toString()}`);
    case 'undefined':
    default:
      return [];
  }
};

export const searchToHttpParams = (searchQuery: ConceptSelector): HttpParams =>
  Object.entries(searchQuery)
    .flatMap(([k, v]) => parametrize(k, v))
    .reduce(
      ((params, [key, value]) =>
        params.append(key, value)
      ),
      new HttpParams()
    );

const deWrap = (ar: string[]): string | string[] =>
  ar.length === 1 ? ar[0] : ar;

export const paramMapToRecord = (pm: ParamMap): Record<string,string|string[]> =>
  Object.fromEntries(pm.keys.map(k => [k, deWrap(pm.getAll(k))]));
