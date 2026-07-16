import {Period, PeriodGroup, PeriodsMap, TimeLineData, Domain} from '../interfaces/timeline';
import {Concept, ConceptAbstract, TemporalConcept} from 'concepts-common/src/interfaces/concept';

export const prepareTimelineData = (concepts: TemporalConcept[]): TimeLineData => {

  const getRelated = (concept: Concept, rId: string): ConceptAbstract[] =>
     (concept.relations?.to ?? [])
      .find(r => (r.relation.id.id === rId && r.relation.id.type === 'chronontology'))
      ?.objects ?? [];

  const first = <T>(array: T[]): T | undefined => {
    return array.length ? array[0] : undefined;
  }

  const getId = (id: ConceptAbstract): string =>
    `${id.id.id}-${id.id.type}`;

  const createPeriod = (concept: TemporalConcept, number: number): Period | undefined => {
    if (!concept.temporalExtends.length) return undefined;
    let timespan = concept.temporalExtends[0]; // TODO what if there are more?
    return {
      id: getId(concept), // TODO tmp
      conceptId: concept.id,
      number,
      name: concept.title || `concept ${concept.id.type}/${concept.id.id}`,
      from: (timespan.start.max - timespan.start.min) / 2 + timespan.start.min,
      earliestFrom: undefined, // timespan.start.min,
      to: (timespan.end.max - timespan.end.min) / 2 + timespan.end.min,
      latestTo: undefined, //  timespan.end.max,
      successor: first(getRelated(concept, 'isFollowedBy').map(getId)), // TODO what if there are more?
      parent: first(getRelated(concept, 'isPartOf').map(getId)), // TODO what if there are more?
      children: getRelated(concept, 'hasPart').map(getId),
      row: 1,
      colorGroup: 0,
      level: 0,
      textVisible: false,
      groupRow: -1,
      periodGroup: createGroup()
    };
  }

  const determinePeriodRows = (periods: Period[], periodsMap: PeriodsMap): void => {
    const periodGroups = assignPeriodsToGroups(periods, periodsMap);

    periodGroups.sort((a, b) => {
      const diff = b.periodsCount - a.periodsCount;
      if (diff === 0) {
        return b.number - a.number;
      } else {
        return diff;
      }
    });
    const rows: Period[][] = [];
    let colorGroupNumber = 1;
    for (let i in periodGroups) {
      for (let rowNumber = 0; rowNumber < 1000; rowNumber++) {
        if (doesPeriodGroupFitInRow(periodGroups[i], rowNumber, rows)) {
          putPeriodGroupToRow(periodGroups[i], rowNumber, rows);
          colorGroupNumber = getColorGroupNumber(colorGroupNumber, periodGroups[i], rows);
          setColorGroup(periodGroups[i], colorGroupNumber);
          break;
        }
      }
    }
  }

  const assignPeriodsToGroups = (periods: Period[], periodsMap: PeriodsMap): PeriodGroup[] => {
    periods.sort((a, b) => {
      if (a.children && a.children.indexOf(b.id) > -1) return -1;
      if (b.children && b.children.indexOf(a.id) > -1) return 1;
      const diff = a.from - b.from;
      if (diff === 0) {
        return b.number - a.number;
      } else {
        return diff;
      }
    });

    const periodGroups: PeriodGroup[] = [];
    let groupNumberCounter = 0;
    for (let i in periods) {
      if (periods[i].periodGroup.number === -1) {
        const rootPeriod = getRootPeriod(periods[i], periodsMap);
        addToGroup(rootPeriod, periodsMap, createGroup(groupNumberCounter++), 0, 0, periodGroups);
        if (periodGroups.indexOf(rootPeriod.periodGroup) === -1) {
          periodGroups.push(rootPeriod.periodGroup);
        }
      }
    }

    for (let i in periods)
      addSuccessorToGroup(periods[i], periodsMap, periodGroups);

    return periodGroups;
  }

  const getRootPeriod = (period: Period, periodsMap: PeriodsMap) => {
    while (period.parent && period.parent[0]) {
      if (period.parent[0] in periodsMap)
        period = periodsMap[period.parent[0]];
      else break;
    }
    return period;
  }

  const createGroup = (groupNumber: number = -1): PeriodGroup => {
    return {
      startRow: 0,
      number: groupNumber,
      rows: [], // Array of rows; a row is an array containing the periods of the row
      periodsCount: 0,
      from: NaN,
      to: NaN
    };
  }

  const addToGroup = (period: Period, periodsMap: PeriodsMap, group: PeriodGroup, row: number, hierarchyLevel: number, periodGroups: PeriodGroup[]) => {
    if (period.periodGroup.number !== -1) return;

    setPeriodGroup(period, group, row, hierarchyLevel);

    for (let i in period.children) {
      if (period.children[i] in periodsMap && period.id !== period.children[i]) {
        let rowNumber = row + 1;
        while (group.rows[rowNumber]
        && !doesPeriodFitInRow(periodsMap[period.children[i]], group.rows[rowNumber])) {
          rowNumber++;
        }
        addToGroup(periodsMap[period.children[i]], periodsMap, group, rowNumber, hierarchyLevel + 1,
          periodGroups);
      }
    }
  }

  const addSuccessorToGroup = (period: Period, periodsMap: PeriodsMap, periodGroups: PeriodGroup[]) => {
    if (period.successor && period.successor in periodsMap && period.id !== period.successor) {
      const successor = periodsMap[period.successor];
      if (successor.periodGroup && successor.periodGroup.periodsCount === 1) {
        periodGroups.splice(periodGroups.indexOf(successor.periodGroup), 1);
        setPeriodGroup(successor, period.periodGroup, period.groupRow, period.level);
        addSuccessorToGroup(successor, periodsMap, periodGroups);
      }
    }
  }

  const setPeriodGroup = (period: Period, group: PeriodGroup, row: number, hierarchyLevel: number) => {
    period.periodGroup = group;
    period.groupRow = row;
    if (!group.rows[row]) group.rows[row] = [];
    period.level = hierarchyLevel;
    group.rows[row].push(period);
    group.periodsCount++;

    if (isNaN(group.from) || group.from > period.from) group.from = period.from;
    if (isNaN(group.to) || group.to < period.to) group.to = period.to;
  }

  const doesPeriodFitInRow = (period: Period, row: Period[]): boolean => {
    for (let i in row) {
      if (!(row[i].to <= period.from || row[i].from >= period.to)) {
        return false;
      }
    }
    return true;
  }

  const doesPeriodGroupFitInRow = (group: PeriodGroup, rowNumber: number, rows: Period[][]): boolean => {
    for (let i = rowNumber; i < rowNumber + group.rows.length; i++) {
      if (!rows[i]) continue;
      for (let j in rows[i]) {
        const period = rows[i][j];
        if (!(period.to <= group.from || period.from >= group.to)) {
          return false;
        }
      }
    }
    return true;
  }

  const putPeriodGroupToRow = (group: PeriodGroup, rowNumber: number, rows: Period[][]) => {
    group.startRow = rowNumber;
    for (let i = 0; i < group.rows.length; i++) {
      for (let j in group.rows[i]) {
        group.rows[i][j].row = rowNumber + i;
        if (!rows[rowNumber + i]) rows[rowNumber + i] = [];
        rows[rowNumber + i].push(group.rows[i][j]);
        rows[rowNumber + i].sort(function (a, b) {
          const diff = a.from - b.from;
          if (diff == 0) {
            return b.number - a.number;
          } else {
            return diff;
          }
        });
      }
    }
  }

  const getColorGroupNumber = (currentColorGroupNumber: number, group: PeriodGroup, rows: Period[][]): number => {
    let colorGroupNumber = currentColorGroupNumber;
    let loops = 0;
    do {
      colorGroupNumber = (colorGroupNumber === 10) ? 1 : colorGroupNumber + 1;
    } while (doAdjacentPeriodGroupsHaveColorGroup(group, colorGroupNumber, rows) && loops++ < 10);
    return colorGroupNumber;
  }

  const doAdjacentPeriodGroupsHaveColorGroup = (group: PeriodGroup, colorGroupNumber: number, rows: Period[][]): boolean => {
    const startRow = (group.startRow === 0) ? 0 : group.startRow - 1;
    const endRow = (group.startRow === 0) ? startRow + group.rows.length : startRow + group.rows.length + 1;
    for (let i = startRow; i <= endRow; i++) {
      for (let j in rows[i]) {
        const period = rows[i][j];
        if (period.colorGroup === colorGroupNumber && intersects(period.from, period.to, group.from, group.to)) return true;
      }
    }

    for (let i = 0; i < group.rows.length; i++) {
      for (let j in group.rows[i]) {
        const rowIndex = rows[group.startRow + i].indexOf(group.rows[i][j]);
        if (rowIndex > 0) {
          period = rows[group.startRow + i][rowIndex - 1];
          if (period.colorGroup === colorGroupNumber && intersects(period.from, period.to, group.from, group.to)) return true;
        }
        if (rowIndex < rows[group.startRow + i].length - 1) {
          period = rows[group.startRow + i][rowIndex + 1];
          if (period.colorGroup === colorGroupNumber && intersects(period.from, period.to, group.from, group.to)) return true;
        }
      }
    }
    return false;
  }

  const intersects = (from1: number, to1: number, from2: number, to2: number): boolean => {
    if (from1 <= from2 && to1 >= from2) return true;
    if (from1 <= to2 && to1 >= to2) return true;
    if (from1 >= from2 && to1 <= to2) return true;
    return false;
  }

  const setColorGroup = (group: PeriodGroup, colorGroupNumber: number) => {
    for (let i in group.rows) {
      for (let j in group.rows[i]) {
        group.rows[i][j].colorGroup = colorGroupNumber;
      }
    }
  }

  const periodsToDisplay: Period[] = [];
  const periodsMap: PeriodsMap = {};
  const xDomain: Domain = [NaN, NaN];

  let periodNumberCounter = 0;
  let period: Period | undefined;
  for (let i in concepts) {
    period = createPeriod(concepts[i], periodNumberCounter++);
    if (!period) continue;
    if (!xDomain[0] || period.from < xDomain[0]) xDomain[0] = period.from;
    if (!xDomain[1] || period.to > xDomain[1]) xDomain[1] = period.to;
    periodsToDisplay.push(period);
    periodsMap[period.id] = period;
  }

  determinePeriodRows(periodsToDisplay, periodsMap);

  return {
    periods: periodsToDisplay,
    periodsMap: periodsMap,
    xDomain: xDomain
  };
}
