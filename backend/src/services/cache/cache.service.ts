import {Injectable} from '@nestjs/common';
import { createHash } from "node:crypto";
import {QueryResult} from 'pg';

const MAX_ENTRIES = 3;

@Injectable()
export class CacheService {
  private readonly cache: {[key: string]: QueryResult} = {};
  private readonly keys: string[] = [];

  private removeFirst(): void {
    const f = this.keys.shift();
    if (!f) return;
    delete this.cache[f];
  }

  store(key: string, result: QueryResult, hash: undefined | string = undefined): string {
    if (this.keys.length >= MAX_ENTRIES) this.removeFirst();
    hash = hash ?? createHash('md5').update(key).digest('hex');
    if (!this.keys.includes(hash)) this.keys.push(hash);
    this.cache[hash] = result;
    return hash;
  }

  get(key: string): { hash: string, result: QueryResult | undefined, cacheCount: number } {
    const hash = createHash('md5').update(key).digest('hex');
    return {
      hash,
      result: this.cache[hash],
      cacheCount: this.keys.length
    };
  }
}
