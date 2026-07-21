import {QueryResult} from "pg";

export interface CacheStore<T> {
  max: number;
  items: {[id: string]: T};
  keys: string[];
}

export interface CacheServiceStore {
  result: CacheStore<QueryResult>;
}

export type CacheServiceStoreKey = keyof  CacheServiceStore;

export type CachedObjectType<K extends CacheServiceStoreKey> = CacheServiceStore[K]['items'][string];

export interface CacheServiceResponse<K extends CacheServiceStoreKey> {
  hash: string;
  result: CachedObjectType<K> | undefined;
  storeCount: number
}
