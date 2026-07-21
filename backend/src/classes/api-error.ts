import {ErrorResponseType} from 'common/interfaces/api';

export class ApiError extends Error {
  type: ErrorResponseType;
  params: string[];
  constructor(
    type: ErrorResponseType = 'unknown-error',
    params: []
  ) {
    super(type);
    this.type = type;
    this.params = params;
  }
}
