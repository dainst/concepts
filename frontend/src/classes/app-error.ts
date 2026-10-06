import {AppMessageType} from '../app/interfaces/error';

export class AppError extends Error {
  readonly type: AppMessageType;
  readonly params: string[];
  readonly debug: unknown = undefined;
  constructor(
    type: AppMessageType = 'unknown-error',
    params: string[] = [],
    debug: unknown = undefined
  ) {
    super(type);
    this.type = type;
    this.params = params;
    this.debug = debug;
  }
}
