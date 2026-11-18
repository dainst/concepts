// generated with script/creates-typeguards.ts

import {SearchResult, ConceptSelector, searchShards, SearchShard} from '../interfaces/search';
import {isConcept, isSource} from './concept.typeguards';

export const isSearchShard = (thing: unknown): thing is SearchShard =>
  (typeof thing === 'string') && (searchShards as readonly string[]).includes(thing);

export const isSearchResult = (thing: unknown): thing is SearchResult =>
  (typeof thing === 'object')
	&& (thing != null)
	&& ('selector' in thing)
	&& (isConceptSelector(thing.selector))
	&& ('count' in thing)
	&& (typeof thing.count === 'number')
	&& ('warnings' in thing)
	&& (Array.isArray(thing.warnings))
	&& (thing.warnings.every(e => typeof e === 'string'))
	&& ('results' in thing)
	&& (Array.isArray(thing.results))
	&& (thing.results.every(isConcept));

export const isConceptSelector = (thing: unknown): thing is ConceptSelector =>
  (typeof thing === 'object')
	&& (thing != null)
	&& ((!('q' in thing)) || ('q' in thing && typeof thing.q === 'string'))
	&& ((!('quickConcept' in thing)) || ('quickConcept' in thing && typeof thing.quickConcept === 'string'))
	&& ((!('domain' in thing)) || ('domain' in thing && typeof thing.domain === 'string'))
	&& ((!('id' in thing)) || ('id' in thing && typeof thing.id === 'string'))
	&& ((!('type' in thing)) || ('type' in thing && typeof thing.type === 'string'))
	&& ((!('limit' in thing)) || ('limit' in thing && typeof thing.limit === 'number'))
	&& ((!('offset' in thing)) || ('offset' in thing && typeof thing.offset === 'number'))
	&& ((!('shards' in thing)) || ('shards' in thing && Array.isArray(thing.shards) && thing.shards.every(isSearchShard)))
	&& ((!('forceCache' in thing)) || ('forceCache' in thing && typeof thing.forceCache === 'boolean'))
	&& ((!('preferredLanguage' in thing)) || ('preferredLanguage' in thing && typeof thing.preferredLanguage === 'string'))
	&& ((!('preferTransliteration' in thing)) || ('preferTransliteration' in thing && typeof thing.preferTransliteration === 'boolean'))
	&& ((!('geoExportFormat' in thing)) || ('geoExportFormat' in thing && (typeof thing.geoExportFormat === 'string' && ["GeoJSON","WKT"].includes(thing.geoExportFormat))))
	&& ((!('includeIds' in thing)) || ('includeIds' in thing && typeof thing.includeIds === 'boolean'))
	&& ((!('includeDeleted' in thing)) || ('includeDeleted' in thing && typeof thing.includeDeleted === 'boolean'));
