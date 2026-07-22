import {Concept} from './concept';

export interface SearchResult {
  selector: ConceptSelector,
  count: number;
  warnings: string[];
  results: Concept[];
}


export const searchShards = ['base', 'labels', 'relations', 'geographical_extends', 'temporal_extends'] as const;

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
