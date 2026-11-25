import {StatisticRow, StatisticVar, statisticVars} from '../interfaces/statistic';

export const isStatisticVar = (thing: unknown): thing is StatisticVar =>
  (typeof thing === 'string') && (statisticVars as readonly string[]).includes(thing);

export const isStatisticRow = (thing: unknown): thing is StatisticRow =>
  (typeof thing === 'object') && (thing != null)
  && ('value' in thing) && (typeof thing.value === 'string')
  && ('count' in thing) && (typeof thing.count === 'number')
  && (!('value2' in thing) || (typeof thing.value2 === 'string'));
