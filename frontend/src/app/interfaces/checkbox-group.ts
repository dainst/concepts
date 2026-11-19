import {ConceptId} from 'concepts-common/interfaces/concept';

export interface CheckboxGroupOption {
  label: string | ConceptId;
  value: string;
  children?: CheckboxGroupOption[];
}
