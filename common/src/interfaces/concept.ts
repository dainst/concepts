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

export interface Concept extends ConceptAbstract {
  readonly labels: Label[];
  readonly relations: RelationAbstractSets;
}

export interface GeographicalConcept extends Concept {
  readonly geographicalExtends: GeographicalExtend[];
}

export interface TemporalConcept extends Concept {
  readonly temporalExtends: TemporalExtend[];
}

export interface RelationAbstractSet {
  readonly relation: ConceptAbstract;
  readonly objects: ConceptAbstract[];
}

export interface RelationAbstractSets {
  readonly to: RelationAbstractSet[];
  readonly from: RelationAbstractSet[];
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
