import {Injectable} from '@nestjs/common';
import { createHash } from "node:crypto";
import {QueryResult} from 'pg';
import {
  CachedObjectType,
  CacheServiceResponse,
  CacheServiceStore,
  CacheServiceStoreKey,
  CacheStore
} from '../../interfaces/cache';

@Injectable()
export class CacheService {
  private readonly stores: CacheServiceStore = {
    result: <CacheStore<QueryResult>>{
      max: 3,
      items: {},
      keys: []
    }
  } ;

  pop<T extends CacheServiceStoreKey>(
    store: T
  ): CachedObjectType<T> | undefined {
    const f = this.stores[store].keys.shift();
    if (!f) return undefined;
    return <CachedObjectType<T>>this.stores[store].items[f];
  }

  store<T extends CacheServiceStoreKey>(
    store: T,
    key: string,
    data: CachedObjectType<T>,
    hash: undefined | string = undefined
  ): string {
    if (this.stores[store].keys.length >= this.stores[store].max) this.pop(store);
    hash = hash ?? createHash('md5').update(key).digest('hex');
    if (!this.stores[store].keys.includes(hash)) this.stores[store].keys.push(hash);
    this.stores[store].items[hash] = data;
    return hash;
  }

  get<T extends CacheServiceStoreKey>(
    store: T,
    key: string
  ): CacheServiceResponse<T> {
    const hash = createHash('md5').update(key).digest('hex');
    return {
      hash,
      result: <CachedObjectType<T>>this.stores[store].items[hash],
      storeCount: this.stores[store].keys.length
    };
  }

  getByHash<T extends CacheServiceStoreKey>(
    store: T,
    hash: string
  ): CacheServiceResponse<T> {
    return {
      hash,
      result: <CachedObjectType<T>>this.stores[store].items[hash],
      storeCount: this.stores[store].keys.length
    };
  }
}
