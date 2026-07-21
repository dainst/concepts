import {ConceptSelector} from './selector';
import {ConceptAbstract} from './concept';

export interface SearchResult {
  selector: ConceptSelector,
  count: number;
  warnings: string[];
  results: ConceptAbstract[];
}

