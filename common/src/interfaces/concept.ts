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
  readonly relations: Relation[];
}

export interface Label {
  readonly type: LabelType;
  readonly label: string;
  readonly language: string;
  readonly transliteration: string;
}

export interface Relation {
  readonly object: ConceptAbstract;
  readonly predicate: ConceptAbstract;
  readonly subject: ConceptAbstract;
}
