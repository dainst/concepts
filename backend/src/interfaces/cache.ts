import {SearchQuery} from 'common/interfaces/search';
import {QueryResult} from "pg";
import {ConceptSelector} from 'common/interfaces/select';

export interface CacheStore<T> {
  max: number;
  items: {[id: string]: T};
  keys: string[];
}

export interface CacheServiceStore {
  result: CacheStore<QueryResult>;
  selector: CacheStore<ConceptSelector>;
}

export type CacheServiceStoreKey = keyof  CacheServiceStore;

export type CachedObjectType<K extends CacheServiceStoreKey> = CacheServiceStore[K]['items'][string];

export interface CacheServiceResponse<K extends CacheServiceStoreKey> {
  hash: string;
  result: CachedObjectType<K> | undefined;
  storeCount: number
}
