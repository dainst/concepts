import {ConceptId} from './concept';

export interface Domain {
  readonly id: string;
  readonly root?: ConceptId;
}
