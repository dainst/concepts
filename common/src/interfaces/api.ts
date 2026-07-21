export type ErrorResponseType = 'unknown-error' | 'internal-server-error';

export interface ErrorResponse {
  readonly type: ErrorResponseType;
  readonly params?: string[];
  readonly debug?: string;
}
