import {QueryResult} from 'pg';
import {Statistic, StatisticVar} from 'common/interfaces/statistic';
import {isStatisticRow} from 'common/functions/statistic.typeguards';

export const convertStatisticResult = (
  var1: StatisticVar, var2: StatisticVar | null, res: QueryResult
): Statistic => ({
  var: var2 ? [var1, var2] : [var1],
  values: res.rows.filter(isStatisticRow)
});
