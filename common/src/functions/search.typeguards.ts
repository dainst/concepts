import {SearchShard, searchShards} from '../interfaces/search';

export const isSearchShard = (thing: unknown): thing is SearchShard =>
  (typeof thing === 'string') && (searchShards as readonly string[]).includes(thing);
