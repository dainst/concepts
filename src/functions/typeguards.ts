import {ConceptRow, LabelRow, RelationRow} from '../interfaces/rows';
import {LabelType, labelTypes} from 'common/interfaces/concept';

export const isConceptRow = (thing: unknown): thing is ConceptRow =>
  (typeof thing === 'object') && (thing != null)
  && ('id' in thing) && (typeof thing.id == 'string')
  && ('type' in thing) && (typeof thing.type == 'string');

export const isRelationRow = (thing: unknown): thing is RelationRow =>
  (typeof thing === 'object') && (thing != null)
  && ('subjectId' in thing) && (typeof thing.subjectId == 'string')
  && ('subjectType' in thing) && (typeof thing.subjectType == 'string')
  && ('predicateId' in thing) && (typeof thing.predicateId == 'string')
  && ('predicateType' in thing) && (typeof thing.predicateType == 'string')
  && ('objectId' in thing) && (typeof thing.objectId == 'string')
  && ('objectType' in thing) && (typeof thing.objectType == 'string');

export const isLabelType = (thing: unknown): thing is LabelType =>
  (typeof thing === 'string') && (labelTypes as readonly string[]).includes(thing);

export const isLabelRow = (thing: unknown): thing is LabelRow =>
  (typeof thing === 'object') && (thing != null)
  && ('id' in thing) && (typeof thing.id == 'number')
  && ('conceptId' in thing) && (typeof thing.conceptId == 'string')
  && ('conceptType' in thing) && (typeof thing.conceptType == 'string')
  && ('labelType' in thing) && isLabelType(thing.labelType)
  && ('language' in thing) && (typeof thing.language == 'string')
  && ('transliteration' in thing) && (typeof thing.transliteration == 'string')
  && ('isPreferred' in thing) && (typeof thing.isPreferred == 'boolean');
