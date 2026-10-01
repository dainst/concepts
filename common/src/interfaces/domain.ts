import {ConceptId} from './concept';

export interface Domain {
  readonly id: string;
  readonly root: ConceptId | null;
  readonly warning?: true;
  readonly subDomains?: Domain[];
}
