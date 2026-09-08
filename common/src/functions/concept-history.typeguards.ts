import {ConceptHistoryEventType, conceptHistoryEventTypes} from '../interfaces/concept-history';

export const isConceptHistoryEventType = (thing: unknown): thing is ConceptHistoryEventType =>
  (typeof thing === 'string') && (conceptHistoryEventTypes as readonly string[]).includes(thing);
