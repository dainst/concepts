export const errorResponseTypes = {
  'unknown-error': 500,
  'internal-server-error': 500,
  'not-found': 404,
  'unpredicted-internal-server-error': 500,
  'framework-error': 500,
} as const;


export type ErrorResponseType = keyof typeof errorResponseTypes;

export interface ErrorResponse {
  readonly type: ErrorResponseType;
  readonly params?: string[];
  readonly debug?: string[];
}
