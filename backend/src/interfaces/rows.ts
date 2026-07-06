import {LabelType} from 'common/interfaces/concept';

export interface ConceptRow {
  readonly id: string;
  readonly type: string;
}

export interface LabelledConceptRow {
  readonly id: string;
  readonly type: string;
  readonly labels: LabelRowAgg[];
}

export interface RelationRow {
  readonly subject_id: string;
  readonly subject_type: string;
  readonly predicate_id: string;
  readonly predicate_type: string;
  readonly object_id: string;
  readonly object_type: string;
}

export interface LabelRowAgg {
  readonly type: LabelType;
  readonly label: string;
  readonly language: string;
  readonly transliteration: string;
  readonly is_preferred: boolean;
}

export interface LabelRow extends LabelRowAgg {
  readonly id: number;
  readonly concept_id: string;
  readonly concept_type: string;
}

export interface GeographicalExtendsRow {
  readonly id: number;
  readonly concept_id: string;
  readonly concept_type: string;
  readonly center: string;
  readonly shape: string;
  readonly certainty: string;
  readonly precision: string;
}
