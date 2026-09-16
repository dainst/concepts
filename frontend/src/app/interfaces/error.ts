import {ErrorResponseBase, errorResponseTypes} from 'concepts-common/interfaces/api';

export const appMessageTypes = {
  ...errorResponseTypes,
  'script-error': 1,
  'unknown-http-error': 1,
  'successful-created': 0,
  'successful-updated': 0
} as const;

export type AppMessageType = keyof typeof appMessageTypes;
export interface AppMessage extends ErrorResponseBase<AppMessageType> {
}
