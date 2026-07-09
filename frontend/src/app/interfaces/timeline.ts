export interface Period {
  id: string;
  number: number; // TODO do we need this?
  name: string;
  from: number;
  earliestFrom: number | undefined;
  to: number;
  latestTo: number | undefined;
  successor: string | undefined;
  parent: string | undefined,
  children: string[],
  row: number,
  colorGroup: number;
  level: number;
  textVisible?: boolean;
  periodGroup: PeriodGroup; // ?
  groupRow: any; // !
}

export interface PeriodRow {
  from: number;
  to: number;
}

export interface PeriodGroup {
  number: number;
  rows: Period[][], // comment form original chron-code: Array of rows; a row is an array containing the periods of the row
  periodsCount: number;
  from: number;
  to: number;
  startRow: number;
}

export type PeriodsMap = {[id: string]: Period};

export type XDomain = [number, number];

export interface TimeLineData {
  periods: Period[],
  periodsMap: PeriodsMap,
  xDomain: XDomain
}
