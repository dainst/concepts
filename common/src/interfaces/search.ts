import {ConceptSelector} from './select';
import {ConceptAbstract} from './concept';

export interface SearchQuery {
  selector: ConceptSelector,
  limit: number;
  offset: number;
}

export interface SearchResult extends SearchQuery {
  searchHash: string;
  count: number;
  warnings: string[];
  results: ConceptAbstract[];
}

