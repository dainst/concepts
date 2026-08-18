import {AppErrorType, appErrorTypes} from '../interfaces/error';

export const isAppErrorType = (thing: unknown): thing is AppErrorType =>
  (typeof thing === 'string') && (thing in appErrorTypes);
