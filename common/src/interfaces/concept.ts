export const labelTypes = [
  'title',
  'description',
  'inverseTitle'
] as const;

export type LabelType = typeof labelTypes[number];

export interface ConceptId {
  readonly id: string;
  readonly type: string;
}

export type PreferredLabels = {
  readonly [type in LabelType]?: string;
};

export interface ConceptAbstract extends PreferredLabels {
  readonly id: ConceptId;
}

export interface RelationalConcept extends ConceptAbstract {
  readonly relationsTo: RelationAbstractSet[];
}

export interface RelatedConcept extends ConceptAbstract {
  readonly relationsFrom: RelationAbstractSet[];
}

export interface LabelledConcept extends ConceptAbstract {
  readonly labels: Label[];
}

export interface GeographicalConcept extends ConceptAbstract {
  readonly geographicalExtends: GeographicalExtend[];
}

export interface TemporalConcept extends ConceptAbstract {
  readonly temporalExtends: TemporalExtend[];
}

export interface Concept extends ConceptAbstract {
  readonly domain: string;
  readonly temporalExtends?: TemporalExtend[];
  readonly geographicalExtends?: GeographicalExtend[];
  readonly labels?: Label[];
  readonly relationsTo?: RelationAbstractSet[];
  readonly relationsFrom?: RelationAbstractSet[];
}

export interface RelationAbstractSet {
  readonly relation: ConceptAbstract;
  readonly objects: ConceptAbstract[];
}

export interface Label {
  readonly type: LabelType;
  readonly label: string;
  readonly language: string;
  readonly transliteration: string;
}

export interface TemporalBound {
  readonly precision: number;
  readonly certainty: number;
  readonly min: number;
  readonly max: number;
}

export interface TemporalExtend {
  readonly start: TemporalBound;
  readonly end: TemporalBound;
}

export interface GeographicalExtend {
  readonly center: string;
  readonly shape: string | null;
  readonly certainty: number;
  readonly precision: number;
}
