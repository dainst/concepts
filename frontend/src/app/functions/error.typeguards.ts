import {AppMessageType, appMessageTypes} from '../interfaces/error';

export const isAppErrorType = (thing: unknown): thing is AppMessageType =>
  (typeof thing === 'string') && (thing in appMessageTypes);
