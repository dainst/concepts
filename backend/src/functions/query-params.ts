import {ConceptSelector, SearchShard, searchShards} from 'common/interfaces/search';
import {isSearchShard} from 'common/functions/search.typeguards';

export const queryParamsToConceptSelector = (queryParams: Record<string,string|string[]>): ConceptSelector => {

  const conv = (key: string, val: string|string[]): string | number | SearchShard[] | string[] => {
    if (['limit', 'offset'].includes(key)) return Number(val);
    if (['shards'].includes(key)) return (Array.isArray(val) ? val : [val]).filter(isSearchShard);
    return val;
  }

  return Object.fromEntries(
    Object.entries(queryParams)
      .map(([key, val]) => [key, conv(key, val)])
  )
}
