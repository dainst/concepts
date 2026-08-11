// generated with script/creates-typeguards.ts

import {ConceptRow, RelationsAgg, LabelsAgg, GeographicalExtendsAgg, TemporalExtendsAgg} from '../interfaces/rows';
import {isLabelType} from 'common/functions/labels.typeguards';

export const isConceptRow = (thing: unknown): thing is ConceptRow =>
  (typeof thing === 'object')
	&& (thing != null)
	&& ('id' in thing)
	&& (typeof thing.id === 'string')
	&& ('type' in thing)
	&& (typeof thing.type === 'string')
	&& ('domain' in thing)
	&& (typeof thing.domain === 'string')
	&& ((!('labels' in thing)) || ('labels' in thing && (Array.isArray(thing.labels) && thing.labels.every(isLabelsAgg)) || (thing.labels == null)))
	&& ((!('geographical_extends' in thing)) || ('geographical_extends' in thing && (Array.isArray(thing.geographical_extends) && thing.geographical_extends.every(isGeographicalExtendsAgg)) || (thing.geographical_extends == null)))
	&& ((!('temporal_extends' in thing)) || ('temporal_extends' in thing && (Array.isArray(thing.temporal_extends) && thing.temporal_extends.every(isTemporalExtendsAgg)) || (thing.temporal_extends == null)))
	&& ((!('relations_to' in thing)) || ('relations_to' in thing && (Array.isArray(thing.relations_to) && thing.relations_to.every(isRelationsAgg)) || (thing.relations_to == null)))
	&& ((!('relations_from' in thing)) || ('relations_from' in thing && (Array.isArray(thing.relations_from) && thing.relations_from.every(isRelationsAgg)) || (thing.relations_from == null)));

export const isRelationsAgg = (thing: unknown): thing is RelationsAgg =>
  (typeof thing === 'object')
	&& (thing != null)
	&& ('predicate_id' in thing)
	&& (typeof thing.predicate_id === 'string')
	&& ('predicate_type' in thing)
	&& (typeof thing.predicate_type === 'string')
	&& ('object_id' in thing)
	&& (typeof thing.object_id === 'string')
	&& ('object_type' in thing)
	&& (typeof thing.object_type === 'string');

export const isLabelsAgg = (thing: unknown): thing is LabelsAgg =>
  (typeof thing === 'object')
	&& (thing != null)
	&& ('type' in thing)
	&& (isLabelType(thing.type))
	&& ('label' in thing)
	&& (typeof thing.label === 'string')
	&& ('language' in thing)
	&& (typeof thing.language === 'string')
	&& ('transliteration' in thing)
	&& (typeof thing.transliteration === 'string')
	&& ('is_preferred' in thing)
	&& (typeof thing.is_preferred === 'boolean');

export const isGeographicalExtendsAgg = (thing: unknown): thing is GeographicalExtendsAgg =>
  (typeof thing === 'object')
	&& (thing != null)
	&& ('center' in thing)
	&& (typeof thing.center === 'string')
	&& ('shape' in thing)
	&& (typeof thing.shape === 'string')
	&& ('certainty' in thing)
	&& (typeof thing.certainty === 'string')
	&& ('precision' in thing)
	&& (typeof thing.precision === 'string');

export const isTemporalExtendsAgg = (thing: unknown): thing is TemporalExtendsAgg =>
  (typeof thing === 'object')
	&& (thing != null)
	&& ('start_min' in thing)
	&& (typeof thing.start_min === 'number')
	&& ('start_max' in thing)
	&& (typeof thing.start_max === 'number')
	&& ('start_precision' in thing)
	&& ((typeof thing.start_precision === 'number') || (thing.start_precision == null))
	&& ('start_certainty' in thing)
	&& ((typeof thing.start_certainty === 'number') || (thing.start_certainty == null))
	&& ('end_min' in thing)
	&& (typeof thing.end_min === 'number')
	&& ('end_max' in thing)
	&& (typeof thing.end_max === 'number')
	&& ('end_precision' in thing)
	&& ((typeof thing.end_precision === 'number') || (thing.end_precision == null))
	&& ('end_certainty' in thing)
	&& ((typeof thing.end_certainty === 'number') || (thing.end_certainty == null))
