import {ErrorResponseBase, errorResponseTypes} from 'concepts-common/interfaces/api';

export const appErrorTypes = {
  ...errorResponseTypes,
  'script-error': 1,
  'unknown-http-error': 1
} as const;

export type AppErrorType = keyof typeof appErrorTypes;
export interface AppError extends ErrorResponseBase<AppErrorType> {}
