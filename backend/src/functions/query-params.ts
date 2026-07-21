import {ConceptSelector} from 'common/interfaces/selector';

export const queryParamsToConceptSelector = (queryParams: Record<string,string>): ConceptSelector => {
  const conv = (key: string, val: string): string | number => {
    if (['limit', 'offset'].includes(key)) return Number(val);
    return val;
  }

  return Object.fromEntries(
    Object.entries(queryParams)
      .map(([key, val]) => [key, conv(key, val)])
  )
}
