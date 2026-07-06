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
  readonly geographicalExtends: GeographicalExtend[];
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

export interface RelationAbstract {
  readonly object: ConceptAbstract;
  readonly predicate: ConceptAbstract;
}

export interface GeographicalExtend {
  readonly center: string;
  readonly shape: string | null;
  readonly certainty: number;
  readonly precision: number;
}
