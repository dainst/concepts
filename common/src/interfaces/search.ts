import {Concept} from './concept';

export interface SearchResult {
  selector: ConceptSelector,
  count: number;
  warnings: string[];
  results: Concept[];
}


export const searchShards = [
  'labels',
  'relations_to',
  'relations_from',
  'geographical_extends',
  'temporal_extends',
  'title'
] as const;

export type SearchShard = typeof searchShards[number];

export interface ConceptSelector {
  q?: string;
  domain?: string;
  id?: string;
  type?: string;
  limit?: number;
  offset?: number;
  shards?: SearchShard[];
}
