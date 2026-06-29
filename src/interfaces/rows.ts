import {LabelType} from 'common/interfaces/concept';

export interface ConceptRow {
  readonly id: string;
  readonly type: string;
}

export interface RelationRow {
  readonly subjectId: string;
  readonly subjectType: string;
  readonly predicateId: string;
  readonly predicateType: string;
  readonly objectId: string;
  readonly objectType: string;
}

export interface LabelRow {
  readonly id: number;
  readonly conceptId: string;
  readonly conceptType: string;
  readonly labelType: LabelType;
  readonly label: string;
  readonly language: string;
  readonly transliteration: string;
  readonly isPreferred: boolean;
}
