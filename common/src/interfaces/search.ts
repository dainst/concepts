import {Concept} from './concept';
import {Settings} from './settings';

export interface SearchResult {
  selector: ConceptSelector,
  count: number;
  warnings: string[];
  results: Concept[];
}


export const searchShards = [
  'labels',
  'relations',
  'geographical_extends',
  'temporal_extends',
  'title'
] as const;

export type SearchShard = typeof searchShards[number];

export interface ConceptSelector {
  q?: string;
  quickConcept?: string;
  domain?: string;
  id?: string;
  type?: string;
  limit?: number;
  offset?: number;
  shards?: SearchShard[];
  forceCache?: boolean;
  preferredLanguage?: string;
  preferTransliteration?: boolean;
  geoExportFormat?: 'GeoJSON' | 'WKT';
  includeIds?: boolean;
}

export type ConceptQueryWithSettings =
  Omit<ConceptSelector, keyof Settings> &
  Required<Pick<ConceptSelector, keyof Settings>>;

// TS2320: Interface Mix cannot simultaneously extend types B and A
// Named property propB of types B and A are not identical.
