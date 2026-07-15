import {ConceptRow, LabelledConceptRow, RelationRow, LabelRowAgg, ConceptExtensionRow, LabelRow, GeographicalExtendsRow, TemporalExtendsRow} from '../interfaces/rows';
import {isLabelType} from 'common/functions/labels.typeguards';


export const isConceptRow = (thing: unknown): thing is ConceptRow =>
	(typeof thing === 'object')
	&& (thing != null)
	&& ('id' in thing)
	&& (typeof thing.id === 'string')
	&& ('type' in thing)
	&& (typeof thing.type === 'string');

export const isLabelledConceptRow = (thing: unknown): thing is LabelledConceptRow =>
	(isConceptRow(thing))
	&& ('labels' in thing)
	&& (Array.isArray(thing.labels))
	&& (thing.labels.every(isLabelRowAgg));

export const isRelationRow = (thing: unknown): thing is RelationRow =>
	(typeof thing === 'object')
	&& (thing != null)
	&& ('subject_id' in thing)
	&& (typeof thing.subject_id === 'string')
	&& ('subject_type' in thing)
	&& (typeof thing.subject_type === 'string')
	&& ('predicate_id' in thing)
	&& (typeof thing.predicate_id === 'string')
	&& ('predicate_type' in thing)
	&& (typeof thing.predicate_type === 'string')
	&& ('object_id' in thing)
	&& (typeof thing.object_id === 'string')
	&& ('object_type' in thing)
	&& (typeof thing.object_type === 'string');

export const isLabelRowAgg = (thing: unknown): thing is LabelRowAgg =>
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

export const isConceptExtensionRow = (thing: unknown): thing is ConceptExtensionRow =>
	(typeof thing === 'object')
	&& (thing != null)
	&& ('concept_id' in thing)
	&& (typeof thing.concept_id === 'string')
	&& ('concept_type' in thing)
	&& (typeof thing.concept_type === 'string');

export const isLabelRow = (thing: unknown): thing is LabelRow =>
	(isLabelRowAgg(thing))
	&& (isConceptExtensionRow(thing))
	&& ('id' in thing)
	&& (typeof thing.id === 'number');

export const isGeographicalExtendsRow = (thing: unknown): thing is GeographicalExtendsRow =>
	(isConceptExtensionRow(thing))
	&& ('id' in thing)
	&& (typeof thing.id === 'number')
	&& ('center' in thing)
	&& (typeof thing.center === 'string')
	&& ('shape' in thing)
	&& (typeof thing.shape === 'string')
	&& ('certainty' in thing)
	&& (typeof thing.certainty === 'string')
	&& ('precision' in thing)
	&& (typeof thing.precision === 'string');

export const isTemporalExtendsRow = (thing: unknown): thing is TemporalExtendsRow =>
	(isConceptExtensionRow(thing))
	&& ('id' in thing)
	&& (typeof thing.id === 'number')
	&& ('start_min' in thing)
	&& (typeof thing.start_min === 'number')
	&& ('start_max' in thing)
	&& (typeof thing.start_max === 'number')
	&& ('start_precision' in thing)
	&& (typeof thing.start_precision === 'number')
	&& ('start_certainty' in thing)
	&& (typeof thing.start_certainty === 'number')
	&& ('end_min' in thing)
	&& (typeof thing.end_min === 'number')
	&& ('end_max' in thing)
	&& (typeof thing.end_max === 'number')
	&& ('end_precision' in thing)
	&& (typeof thing.end_precision === 'number')
	&& ('end_certainty' in thing)
	&& (typeof thing.end_certainty === 'number')
