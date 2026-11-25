export const statisticVars = [
  'domain',
  'type',
  'lastEvent',
  'status',
  'geographicExtend',
  'temporalExtend',
  'label',
  'source'
] as const;

export type StatisticVar = typeof statisticVars[number];

export interface StatisticRow {
  value: string;
  value2?: string;
  count: number;
}

export interface Statistic {
  var: [StatisticVar] | [StatisticVar, StatisticVar]
  values: StatisticRow[];
}
