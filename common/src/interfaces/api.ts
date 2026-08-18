export const errorResponseTypes = {
  'unknown-error': 500,
  'internal-server-error': 500,
  'not-found': 404,
  'unpredicted-internal-server-error': 500,
  'framework-error': 500,
} as const;


export type ErrorResponseType = keyof typeof errorResponseTypes;

export interface ErrorResponseBase<T> {
  readonly type: T;
  readonly params?: string[];
  readonly debug?: string[];
}

export type ErrorResponse = ErrorResponseBase<ErrorResponseType>;
