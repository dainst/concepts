import {ErrorResponseType} from 'common/interfaces/api';

export class ApiError extends Error {
  readonly type: ErrorResponseType;
  readonly params: string[];
  readonly debug: any = undefined;
  constructor(
    type: ErrorResponseType = 'unknown-error',
    params: string[] = [],
    debug: any = undefined
  ) {
    super(type);
    this.type = type;
    this.params = params;
    this.debug = debug;
  }
}
