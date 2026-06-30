import {ConceptRow, GeographicalExtendsRow, LabelRow, RelationRow} from '../interfaces/rows';
import {LabelType, labelTypes} from 'common/interfaces/concept';

export const isConceptRow = (thing: unknown): thing is ConceptRow =>
  (typeof thing === 'object') && (thing != null)
  && ('id' in thing) && (typeof thing.id == 'string')
  && ('type' in thing) && (typeof thing.type == 'string');

export const isRelationRow = (thing: unknown): thing is RelationRow =>
  (typeof thing === 'object') && (thing != null)
  && ('subject_id' in thing) && (typeof thing.subject_id == 'string')
  && ('subject_type' in thing) && (typeof thing.subject_type == 'string')
  && ('predicate_id' in thing) && (typeof thing.predicate_id == 'string')
  && ('predicate_type' in thing) && (typeof thing.predicate_type == 'string')
  && ('object_id' in thing) && (typeof thing.object_id == 'string')
  && ('object_type' in thing) && (typeof thing.object_type == 'string');

export const isLabelType = (thing: unknown): thing is LabelType =>
  (typeof thing === 'string') && (labelTypes as readonly string[]).includes(thing);

export const isLabelRow = (thing: unknown): thing is LabelRow =>
  (typeof thing === 'object') && (thing != null)
  && ('id' in thing) && (typeof thing.id == 'number')
  && ('concept_id' in thing) && (typeof thing.concept_id == 'string')
  && ('concept_type' in thing) && (typeof thing.concept_type == 'string')
  && ('type' in thing) && isLabelType(thing.type)
  && ('language' in thing) && (typeof thing.language == 'string')
  && ('transliteration' in thing) && (typeof thing.transliteration == 'string')
  && ('is_preferred' in thing) && (typeof thing.is_preferred == 'boolean');

export const isGeographicalExtendsRow  = (thing: unknown): thing is GeographicalExtendsRow =>
  (typeof thing === 'object') && (thing != null)
  && ('id' in thing) && (typeof thing.id == 'number')
  && ('concept_id' in thing) && (typeof thing.concept_id == 'string')
  && ('concept_type' in thing) && (typeof thing.concept_type == 'string')
  && ('center' in thing) && (typeof thing.center == 'string')
  && ('shape' in thing) && (typeof thing.shape == 'string' || thing.shape == null)
  && ('certainty' in thing) && (typeof thing.certainty == 'string')
  && ('precision' in thing) && (typeof thing.precision == 'string');
