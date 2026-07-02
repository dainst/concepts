const flatEntries = (input: object): [string, any][] =>
  Object.entries(input ?? {})
    .map(e => ((typeof e[1] === 'object') ? flatEntries(e[1]) : [e]))
    .flat();
export const flatten = (input: object): object => Object.fromEntries(flatEntries(input));
