// generated with script/creates-typeguards.ts

import {ConceptId, ConceptAbstract, RelationalConcept, RelatedConcept, LabelledConcept, GeographicalConcept, TemporalConcept, Concept, RelationAbstractSet, Label, TemporalBound, TemporalExtend, GeographicalExtend} from '../interfaces/concept';
import {isPreferredLabels} from './labels.typeguards';

export const isConceptId = (thing: unknown): thing is ConceptId =>
  (typeof thing === 'object')
	&& (thing != null)
	&& ('id' in thing)
	&& (typeof thing.id === 'string')
	&& ('type' in thing)
	&& (typeof thing.type === 'string');

export const isConceptAbstract = (thing: unknown): thing is ConceptAbstract =>
  (isPreferredLabels(thing))
	&& ('id' in thing)
	&& (isConceptId(thing.id));

export const isRelationalConcept = (thing: unknown): thing is RelationalConcept =>
  (isConceptAbstract(thing))
	&& ('relationsTo' in thing)
	&& (Array.isArray(thing.relationsTo))
	&& (thing.relationsTo.every(isRelationAbstractSet));

export const isRelatedConcept = (thing: unknown): thing is RelatedConcept =>
  (isConceptAbstract(thing))
	&& ('relationsFrom' in thing)
	&& (Array.isArray(thing.relationsFrom))
	&& (thing.relationsFrom.every(isRelationAbstractSet));

export const isLabelledConcept = (thing: unknown): thing is LabelledConcept =>
  (isConceptAbstract(thing))
	&& ('labels' in thing)
	&& (Array.isArray(thing.labels))
	&& (thing.labels.every(isLabel));

export const isGeographicalConcept = (thing: unknown): thing is GeographicalConcept =>
  (isConceptAbstract(thing))
	&& ('geographicalExtends' in thing)
	&& (Array.isArray(thing.geographicalExtends))
	&& (thing.geographicalExtends.every(isGeographicalExtend));

export const isTemporalConcept = (thing: unknown): thing is TemporalConcept =>
  (isConceptAbstract(thing))
	&& ('temporalExtends' in thing)
	&& (Array.isArray(thing.temporalExtends))
	&& (thing.temporalExtends.every(isTemporalExtend));

export const isConcept = (thing: unknown): thing is Concept =>
  (isConceptAbstract(thing))
	&& ('domain' in thing)
	&& (typeof thing.domain === 'string')
	&& ((!('temporalExtends' in thing)) || ('temporalExtends' in thing && Array.isArray(thing.temporalExtends) && thing.temporalExtends.every(isTemporalExtend)))
	&& ((!('geographicalExtends' in thing)) || ('geographicalExtends' in thing && Array.isArray(thing.geographicalExtends) && thing.geographicalExtends.every(isGeographicalExtend)))
	&& ((!('labels' in thing)) || ('labels' in thing && Array.isArray(thing.labels) && thing.labels.every(isLabel)))
	&& ((!('relationsTo' in thing)) || ('relationsTo' in thing && Array.isArray(thing.relationsTo) && thing.relationsTo.every(isRelationAbstractSet)))
	&& ((!('relationsFrom' in thing)) || ('relationsFrom' in thing && Array.isArray(thing.relationsFrom) && thing.relationsFrom.every(isRelationAbstractSet)));

export const isRelationAbstractSet = (thing: unknown): thing is RelationAbstractSet =>
  (typeof thing === 'object')
	&& (thing != null)
	&& ('relation' in thing)
	&& (isConceptAbstract(thing.relation))
	&& ('objects' in thing)
	&& (Array.isArray(thing.objects))
	&& (thing.objects.every(isConceptAbstract));

export const isLabel = (thing: unknown): thing is Label =>
  (typeof thing === 'object')
	&& (thing != null)
	&& ('type' in thing)
	&& ((typeof thing.type === 'string' && ["title","description","inverseTitle"].includes(thing.type)))
	&& ('label' in thing)
	&& (typeof thing.label === 'string')
	&& ('language' in thing)
	&& (typeof thing.language === 'string')
	&& ('transliteration' in thing)
	&& (typeof thing.transliteration === 'string');

export const isTemporalBound = (thing: unknown): thing is TemporalBound =>
  (typeof thing === 'object')
	&& (thing != null)
	&& ('precision' in thing)
	&& (typeof thing.precision === 'number')
	&& ('certainty' in thing)
	&& (typeof thing.certainty === 'number')
	&& ('min' in thing)
	&& (typeof thing.min === 'number')
	&& ('max' in thing)
	&& (typeof thing.max === 'number');

export const isTemporalExtend = (thing: unknown): thing is TemporalExtend =>
  (typeof thing === 'object')
	&& (thing != null)
	&& ('start' in thing)
	&& (isTemporalBound(thing.start))
	&& ('end' in thing)
	&& (isTemporalBound(thing.end));

export const isGeographicalExtend = (thing: unknown): thing is GeographicalExtend =>
  (typeof thing === 'object')
	&& (thing != null)
	&& ('center' in thing)
	&& (typeof thing.center === 'string')
	&& ('shape' in thing)
	&& ((typeof thing.shape === 'string') || (thing.shape == null))
	&& ('certainty' in thing)
	&& (typeof thing.certainty === 'number')
	&& ('precision' in thing)
	&& (typeof thing.precision === 'number')
