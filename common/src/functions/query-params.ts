import {ConceptSelector} from '../interfaces/search';
import {isSearchShard} from './search.typeguards';
import {isConceptType} from './constants.typeguards';

export const queryParamsToConceptSelector = (queryParams: Record<string,string|string[]>): ConceptSelector => {
  const query: ConceptSelector = {};

  if (typeof queryParams['q'] === 'string')
    query.q = queryParams['q'];
  if (typeof queryParams['quickConcept'] === 'string')
    query.q = queryParams['quickConcept'];
  if (typeof queryParams['domain'] === 'string')
    query.domain = queryParams['domain'];
  if (typeof queryParams['id'] === 'string')
    query.id = queryParams['id'];

  if (isConceptType(queryParams['type']))
    query.type = queryParams['type'];
  if (Array.isArray(queryParams['type']))
    query.type = queryParams['type']
      .filter(isConceptType);

  if (typeof queryParams['limit'] === 'string')
    query.limit = parseInt(queryParams['limit']);
  if (typeof queryParams['offset'] === 'string')
    query.limit = parseInt(queryParams['offset']);

  if (Array.isArray(queryParams['shards']) && queryParams['shards'].every(isSearchShard))
    query.shards = queryParams['shards'];

  if (typeof queryParams['preferredLanguage'] === 'string')
    query.preferredLanguage = queryParams['preferredLanguage'];

  if (typeof queryParams['geoExportFormat'] === 'string'
    && (queryParams['geoExportFormat'] === 'GeoJSON' || queryParams['geoExportFormat'] === 'WKT')
  )
    query.geoExportFormat = queryParams['geoExportFormat'];

  // TODO check how booleans get encoded
  if (typeof queryParams['forceCache'] === 'string')
    query.forceCache = true;

  if (typeof queryParams['includeIds'] === 'string')
    query.includeIds = true;

  if (typeof queryParams['includeDeleted'] === 'string')
    query.includeDeleted = true;

  return query;
};



