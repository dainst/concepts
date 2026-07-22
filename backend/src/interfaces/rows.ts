import {LabelType} from 'common/interfaces/concept';


export interface ConceptRow {
  readonly id: string;
  readonly type: string;
  readonly labels?: LabelsAgg[];
  readonly domain: string;
  readonly geographicalExtends?: GeographicalExtendsAgg[];
  readonly temporalExtends?: TemporalExtendsAgg[];
  readonly relationsTo?: RelationsAgg[];
}

export interface RelationsAgg {
  readonly subject_id: string;
  readonly subject_type: string;
  readonly predicate_id: string;
  readonly predicate_type: string;
  readonly object_id: string;
  readonly object_type: string;
}

export interface LabelsAgg {
  readonly type: LabelType;
  readonly label: string;
  readonly language: string;
  readonly transliteration: string;
  readonly is_preferred: boolean;
}

export interface GeographicalExtendsAgg {
  readonly center: string;
  readonly shape: string;
  readonly certainty: string;
  readonly precision: string;
}

export interface TemporalExtendsAgg {
  readonly start_min: number;
  readonly start_max: number;
  readonly start_precision: number;
  readonly start_certainty: number;
  readonly end_min: number;
  readonly end_max: number;
  readonly end_precision: number;
  readonly end_certainty: number;
}
