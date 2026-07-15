import {LabelType} from 'common/interfaces/concept';

export interface ConceptRow {
  readonly id: string;
  readonly type: string;
}

export interface LabelledConceptRow extends ConceptRow {
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

export interface ConceptExtensionRow {
  readonly concept_id: string;
  readonly concept_type: string;
}

export interface LabelRow extends LabelRowAgg, ConceptExtensionRow {
  readonly id: number;
}

export interface GeographicalExtendsRow extends ConceptExtensionRow {
  readonly id: number;
  readonly center: string;
  readonly shape: string;
  readonly certainty: string;
  readonly precision: string;
}

export interface TemporalExtendsRow extends ConceptExtensionRow {
  readonly id: number;
  readonly start_min: number;
  readonly start_max: number;
  readonly start_precision: number;
  readonly start_certainty: number;
  readonly end_min: number;
  readonly end_max: number;
  readonly end_precision: number;
  readonly end_certainty: number;
}
