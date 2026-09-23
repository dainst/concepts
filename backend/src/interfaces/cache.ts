import {QueryResult} from 'pg';
import {ConceptRow} from './concept-row';

export interface CacheStore<T> {
  max: number;
  items: { [id: string]: T };
  keys: string[];
}

export interface CacheServiceStore {
  concepts: CacheStore<QueryResult<ConceptRow>>;
  count: CacheStore<QueryResult<{ count: number }>>;
}

export type CacheServiceStoreKey = keyof CacheServiceStore;

export type CachedObjectType<K extends CacheServiceStoreKey> =
  CacheServiceStore[K]['items'][string];

export interface CacheServiceResponse<K extends CacheServiceStoreKey> {
  hash: string;
  result: CachedObjectType<K> | undefined;
  storeCount: number;
}
