import {ConceptId} from '../interfaces/concept';

export const stringifyId = (cid: ConceptId): string => `${cid.type}/${cid.id}`;

export const findConceptIdInString = (input: string): [string | null, string] =>  {
  const value = input.trim();

  const fragment = value.match(/^#?([^/]+)\/([^/]+)$/);
  if (fragment) {
    return [fragment[1], fragment[2]];
  }

  try {
    const url = new URL(value);
    const parts = url.pathname.split("/").filter(Boolean);

    if (parts.length >= 2) {
      return [parts.at(-2)!, parts.at(-1)!];
    }
  } catch {
    // ignore
  }

  return [null, input];
}
