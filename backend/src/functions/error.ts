export const getErrorCode = (err: unknown): number => {
  if (typeof err !== 'object' || err == null) return -1;
  if (!('code' in err) || typeof err.code !== 'number') return -2;
  return err['code'];
};


export const getErrorMessage = (err: unknown): string => {
  if (err instanceof AggregateError)
    return err.errors
      .map(getErrorMessage)
      .join();
  if (err instanceof Error)
    return err.message;
  return 'Unknown error';
};
