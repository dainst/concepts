import {ConceptSelector, SearchShard} from 'common/interfaces/search';
import {Settings} from 'common/interfaces/settings';

const buildWhere = (selector: ConceptSelector): string => {
  const existsCond = (agg: string, where: string): string => `exists (
        select 1 from ${agg} where ${where} and concepts.id = ${agg}.concept_id and concepts.type = ${agg}.concept_type
      )`;
  let conditions= Object.entries(selector)
    .map(([cond, val]) => {
      switch (cond) {
        case 'q':
          return existsCond('labels', `label ilike '%${selector.q}%'`);
        case 'id':
          return `concepts.id = '${selector.id}'`;
        case 'type':
          return `concepts.type = '${selector.type}'`;
        case 'domain':
          return `concepts.domain_id = '${selector.domain}'`;
        case 'limit':
        case 'offset':
        default:
          return undefined;
      }
    })
    .filter(a => !!a);
  return (conditions.length ? 'where ' : '')
    + conditions
      .map(e => `(${e})`)
      .join(' and ');
}

const autoCompleteShards = (selector: ConceptSelector): SearchShard[] => {
  const uniqueShard = selector.shards ?? [];
  if (selector.q) uniqueShard.push('labels', 'title');
  return [...new Set<SearchShard>(uniqueShard)];
}

export const searchSql = (selector: ConceptSelector, settings: Settings) => {
  const geoFn = settings.geoExportFormat === 'WKT' ? 'ST_AsText' : 'ST_AsGeoJSON';
  const shards = autoCompleteShards(selector);
  const select= [
    `concepts.id as id`,
    `concepts.type as type`,
    `concepts.domain_id as domain`,
    ...shards
  ];
  const shardJoinsMap: {[s in SearchShard]: string} = {
    geographical_extends: `left join lateral (
        select
          json_agg(json_build_object(
            'center', ${geoFn}(geographical_extends.center),
            'shape', ${geoFn}(geographical_extends.shape),
            'certainty', certainty,
            'precision', precision
          )) as geographical_extends
        from geographical_extends
        where concepts.id = geographical_extends.concept_id and concepts.type = geographical_extends.concept_type
      ) on true`,
    labels: `left join lateral (
        select
          json_agg(json_build_object(
            'type', labels.type,
            'label', labels.label,
            'language', labels.language,
            'transliteration', labels.transliteration,
            'is_preferred', labels.is_preferred
          )) as labels
        from labels
        where concepts.id = labels.concept_id and concepts.type = labels.concept_type
      ) on true`,
    relations: `left join lateral (
        select
          json_agg(json_build_object(
            'predicate_id', app_expanded_relations.predicate_id,
            'predicate_type', app_expanded_relations.predicate_type,
            'object_id', app_expanded_relations.object_id,
            'object_type', app_expanded_relations.object_type
          )) as relations
        from app_expanded_relations
        where
          (concepts.id = app_expanded_relations.subject_id and concepts.type = app_expanded_relations.subject_type)
      ) on true`,
    temporal_extends: `left join lateral (
        select
          json_agg(json_build_object(
            'start_min', temporal_extends.start_min,
            'start_max', temporal_extends.start_max,
            'end_min', temporal_extends.end_min,
            'end_max', temporal_extends.end_max,
            'start_precision', temporal_extends.start_precision,
            'end_precision', temporal_extends.end_precision,
            'start_certainty', temporal_extends.start_certainty,
            'end_certainty', temporal_extends.end_certainty
          )) as temporal_extends
        from temporal_extends
        where concepts.id = temporal_extends.concept_id and concepts.type = temporal_extends.concept_type
      ) on true`,
    title: `left join lateral (
        select
          label as title,
          case
            when language = '${settings.preferredLanguage}' then 2
            when language = 'eng' then 1
            else 0
          end as rank
        from labels
        where concept_type = concepts.type and concept_id = concepts.id
        and labels.type = 'title'
        order by rank desc
        limit 1
      ) on true`, // TODO use settings.preferTransliteration

  };

  return `select
    ${(select).join(`,\n\t\t`)}
  from concepts
    ${(shards).map((s: SearchShard) => shardJoinsMap[s]).join(`\n\t\t\t`)}
  ${buildWhere(selector)}
  limit ${selector.limit ?? 10}
  offset ${selector.offset ?? 0}`;
}

export const searchCountSql = (selector: ConceptSelector) => `
  select
    count(*) as count
  from (
    select
      concept_id, concept_type from concepts
      left join labels on concepts.id = labels.concept_id and concepts.type = labels.concept_type
    ${buildWhere(selector)}
    group by concept_id, concept_type
  )`;
