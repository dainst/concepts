import {ById} from '../interfaces/select';

export const isById = (thing: unknown): thing is ById =>
  (typeof thing === 'object') && (thing != null)
  && ('id' in thing) && (typeof thing.id === 'string')
  && ('type' in thing) && (typeof thing.type === 'string');
