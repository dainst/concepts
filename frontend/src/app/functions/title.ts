export const removeSuffices = (str: string): string =>
  str.replace(/\W?\(.+?\)$/, '');
