import {ConceptQueryWithSettings, ConceptSelector, SearchShard} from 'common/interfaces/search';
import {findConceptIdInString} from 'common/functions/concept-id';
import {SqlCommand, SqlCommandParams} from '../interfaces/sql';

export const joinSqlFragments = (glue: string, fragments: SqlCommand[], braces: boolean = true): SqlCommand => {
  const commands: string[] = [];
  const params: SqlCommandParams = [];
  fragments
    .forEach((input: SqlCommand) => {
      const [head, ...rest] = input;
      commands.push(braces ? `(${head})` : head);
      params.push(...rest);
    });
  return [
    commands.join(` ${glue} `),
    ...params
  ];
};

export const existsCond = (agg: string, where: SqlCommand): SqlCommand => {
  const [head, ...rest] = where;
  return [
    `exists (select 1 from ${agg} where ${head} and app_concepts.id = ${agg}.concept_id and app_concepts.type = ${agg}.concept_type)`,
    ...rest
  ];
};

export const buildWhere = (selector: ConceptSelector): SqlCommand => {
  const conditions: SqlCommand[] = Object.entries(selector)
    .flatMap(([cond, val]): SqlCommand[] => {
      switch (cond) {
        case 'q':
          return [existsCond('labels', [`label ilike ¿`, `%${selector.q}%`])];
        case 'quickConcept':
          const id = findConceptIdInString(val);
          const matchTitleOrId: SqlCommand = joinSqlFragments('or', [
            existsCond('labels', [`label ilike ¿`, `%${id[1]}%`]), // TODO auf title beschränken?
            [`app_concepts.id ilike ?`, id[1]]
          ]);
          if (!id[0]) return [matchTitleOrId];
          return [matchTitleOrId, [`type = ¿`, id[0]]];
        case 'id':
          return [[`app_concepts.id = ¿`, selector.id || null]];
        case 'type':
          return [[`app_concepts.type = ¿`, selector.type || null]];
        case 'domain':
          return [[`app_concepts.domain_id = ¿`, selector.domain || null]];
        case 'limit':
        case 'offset':
        default:
          return [];
      }
    });
  if (!selector.includeDeleted) conditions.push([`last_event not in ('replace', 'delete')`]);
  return conditions.length ? joinSqlFragments('and', conditions) : ['1=1'];
};

const autoCompleteShards = (selector: ConceptQueryWithSettings): SearchShard[] => {
  const uniqueShard = selector.shards ?? [];
  if (selector.q) uniqueShard.push('labels', 'title');
  return [...new Set<SearchShard>(uniqueShard)];
};

export const searchSql = (selector: ConceptQueryWithSettings): SqlCommand => {
  const geoFn = selector.geoExportFormat === 'WKT' ? 'ST_AsText' : 'ST_AsGeoJSON';
  const shards = autoCompleteShards(selector);
  const includeIds = selector.includeIds ? `, 'id', id` : '';
  const select= [
    'app_concepts.id as id',
    'app_concepts.type as type',
    'app_concepts.domain_id as domain',
    'app_concepts.last_event as last_event',
    'app_concepts.last_event_value as last_event_value',
    ...shards
  ];
  const shardJoinsMap: {[s in SearchShard]: SqlCommand} = {
    geographical_extends: [`left join lateral (
        select
          json_agg(json_build_object(
            'center', ${geoFn}(geographical_extends.center),
            'shape', ${geoFn}(geographical_extends.shape),
            'certainty', certainty,
            'precision', precision
            ${includeIds}
          )) as geographical_extends
        from geographical_extends
        where app_concepts.id = geographical_extends.concept_id and app_concepts.type = geographical_extends.concept_type
      ) on true`],
    labels: [`left join lateral (
        select
          json_agg(json_build_object(
            'type', labels.type,
            'label', labels.label,
            'language', labels.language,
            'transliteration', labels.transliteration,
            'is_preferred', labels.is_preferred
            ${includeIds}
          )) as labels
        from labels
        where app_concepts.id = labels.concept_id and app_concepts.type = labels.concept_type
      ) on true`],
    relations: [`left join lateral (
        select
          json_agg(json_build_object(
            'predicate_id', app_expanded_relations.predicate_id,
            'predicate_type', app_expanded_relations.predicate_type,
            'object_id', app_expanded_relations.object_id,
            'object_type', app_expanded_relations.object_type
          )) as relations
        from app_expanded_relations
        where
          (app_concepts.id = app_expanded_relations.subject_id and app_concepts.type = app_expanded_relations.subject_type)
      ) on true`],
    temporal_extends: [`left join lateral (
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
            ${includeIds}
          )) as temporal_extends
        from temporal_extends
        where app_concepts.id = temporal_extends.concept_id and app_concepts.type = temporal_extends.concept_type
      ) on true`],
    title: [`left join lateral (
        select
          label as title,
          case
            when language = ¿ then 2
            when language = 'eng' then 1
            else 0
          end as rank
        from labels
        where concept_type = app_concepts.type and concept_id = app_concepts.id
        and labels.type = 'title'
        order by rank desc
        limit 1
      ) on true`, selector.preferredLanguage] // TODO use selector.preferTransliteration

  };

  const [joins, ...joinParams] = joinSqlFragments('\n\t\t\t', shards.map((s: SearchShard) => shardJoinsMap[s]), false)
  const [where, ...whereParams] = buildWhere(selector);
  const sql = `select
      ${(select).join(',\n\t\t')}
    from app_concepts
      ${joins}
    where ${where}
    limit ${selector.limit ?? 10}
    offset ${selector.offset ?? 0}`;
  const params: SqlCommandParams = [
    ...joinParams,
    ...whereParams
  ];
  return preprocessSql(sql, params);
};

export const preprocessSql = (sql: string, params: SqlCommandParams): SqlCommand => {
  let index = 0;
  const finalSql = sql.replace(/¿/g, () => `$${++index}`);
  if (index !== params.length) throw new Error(`Sql statement preprocessing failed. params: ${params.length}, but placeholder ws found ${index} times`);
  return [finalSql, ...params];
};

export const searchCountSql = (selector: ConceptSelector): SqlCommand => {
  const [where, ...params] = buildWhere(selector);
  const sql = `
    select
      count(*) as count
    from (
      select
        concept_id, concept_type from app_concepts
        left join labels on app_concepts.id = labels.concept_id and app_concepts.type = labels.concept_type
      where ${where}
      group by concept_id, concept_type
    )`;
  return preprocessSql(sql, params);
};
