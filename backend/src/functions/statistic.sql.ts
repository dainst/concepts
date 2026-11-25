import {StatisticVar} from 'common/interfaces/statistic';

export const statisticQueries = {
  type: `select count(*) as count, type::text as value from concepts group by type order by count`,
  domain: `select count(*) as count,  domain_id as value from concepts group by domain_id order by count`,
  lastEvent: `select count(*) as count, lastEvent as value from app_concepts group by lastEvent order by count`
};

const statisticQueryParts: {[t in StatisticVar]: {select: string}} = {
  type: {
    select: 'type::text'
  },
  domain: {
    select: 'domain_id'
  },
  lastEvent: {
    select: 'last_event::text'
  },
  status: {
    select: `case when last_event not in ('replace', 'delete') or last_event is null then 'published' else 'deleted' end`
  }
};

export const statisticSql = (var1: StatisticVar, var2: StatisticVar | null): string => {
    return `
      select
        count(*) as count,
        ${statisticQueryParts[var1].select} as value
        ${!!var2 ? ', ' + statisticQueryParts[var2].select + ' as value2' : ''}
      from
        app_concepts
      group by value ${!!var2 ? ', value2' : ''}
      order by count`;
};
