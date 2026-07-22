import {ErrorResponseType} from 'common/interfaces/api';

export class ApiError extends Error {
  readonly type: ErrorResponseType;
  readonly params: string[];
  constructor(
    type: ErrorResponseType = 'unknown-error',
    params: string[] = []
  ) {
    super(type);
    this.type = type;
    this.params = params;
  }
}
