import {ById, BySearch, BySearchHash} from 'common/interfaces/select';

export const isById = (thing: unknown): thing is ById =>
  (typeof thing === 'object') && (thing != null)
  && ('id' in thing) && (typeof thing.id === 'string')
  && ('type' in thing) && (typeof thing.type === 'string');

export const isByQ = (thing: unknown): thing is BySearch =>
  (typeof thing === 'object') && (thing != null)
  && ('q' in thing) && (typeof thing.q === 'string');

export const isBySearchHash = (thing: unknown): thing is BySearchHash =>
  (typeof thing === 'object') && (thing != null)
  && ('hash' in thing) && (typeof thing.hash === 'string');
