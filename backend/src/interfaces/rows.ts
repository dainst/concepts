import {LabelType} from 'common/interfaces/concept';


export interface ConceptRow {
  readonly id: string;
  readonly type: string;
  readonly domain: string;
  readonly labels?: LabelsAgg[] | null;
  readonly geographical_extends?: GeographicalExtendsAgg[] | null;
  readonly temporal_extends?: TemporalExtendsAgg[] | null;
  readonly relations_to?: RelationsAgg[] | null;
  readonly relations_from?: RelationsAgg[] | null;
}

export interface RelationsAgg {
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
  readonly start_precision: number | null;
  readonly start_certainty: number | null;
  readonly end_min: number;
  readonly end_max: number;
  readonly end_precision: number | null;
  readonly end_certainty: number | null;
}
