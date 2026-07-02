import {ById, ByQ} from 'common/interfaces/select';

export const isById = (thing: unknown): thing is ById =>
  (typeof thing === 'object') && (thing != null)
  && ('id' in thing) && (typeof thing.id === 'string')
  && ('type' in thing) && (typeof thing.type === 'string');

export const isByQ = (thing: unknown): thing is ByQ =>
  (typeof thing === 'object') && (thing != null)
  && ('q' in thing) && (typeof thing.q === 'string');
