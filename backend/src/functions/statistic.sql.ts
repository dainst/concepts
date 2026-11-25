import {StatisticVar} from 'common/interfaces/statistic';

export const statisticQueries = {
  type: `select count(*) as count, type::text as value from concepts group by type order by count`,
  domain: `select count(*) as count,  domain_id as value from concepts group by domain_id order by count`,
  lastEvent: `select count(*) as count, lastEvent as value from app_concepts group by lastEvent order by count`
};

const statisticQueryParts: {[t in StatisticVar]: string} = {
  type: 'type::text',
  domain: 'domain_id',
  lastEvent: 'last_event::text',
  status: `case when last_event not in ('replace', 'delete') or last_event is null then 'published' else 'deleted' end`,
  geographicExtend: `case when exists(
      select 1 from geographical_extends where app_concepts.type = geographical_extends.concept_type and app_concepts.id = geographical_extends.concept_id
    ) then 'has_ge:yes' else 'has_ge:no' end`,
  temporalExtend: `case when exists(
      select 1 from temporal_extends where app_concepts.type = temporal_extends.concept_type and app_concepts.id = temporal_extends.concept_id
    ) then 'has_te:yes' else 'has_te:no' end`,
  source: `case when exists(
      select 1 from sources where app_concepts.type = sources.concept_type and app_concepts.id = sources.concept_id
    ) then 'has_source:yes' else 'has_source:no' end`,
  label: 'value'
};

const labelPrefix =
  `with app_concepts as (
    select 'hasTitle' as value, *
    from app_concepts
    where exists(select 1 from labels where app_concepts.type = labels.concept_type and app_concepts.id = labels.concept_id and labels.type = 'title')
    union all
    select 'hasDescription' as value, *
    from app_concepts
    where exists(select 1 from labels where app_concepts.type = labels.concept_type and app_concepts.id = labels.concept_id and labels.type = 'description')
    union all
    select 'noLabel' as value, *
    from app_concepts
    where not exists(select 1 from labels where app_concepts.type = labels.concept_type and app_concepts.id = labels.concept_id)
  )`;

export const statisticSql = (var1: StatisticVar, var2: StatisticVar | null): string => {
    return `
      ${[var1, var2].includes('label') ? labelPrefix : ''}
      select
        count(*) as count,
        value
        ${!!var2 ? ', value2' : ''}
      from (
        select
          ${statisticQueryParts[var1]} as value
          ${!!var2 ? ', ' + statisticQueryParts[var2] + ' as value2' : ''}
        from app_concepts
        ) as t
      group by value ${!!var2 ? ', value2' : ''}
      order by count`;
};
