import {
  Concept,
  GeographicalExtend,
  Label,
  RelationAbstractSet,
  TemporalExtend
} from 'common/interfaces/concept';
import {
  ConceptRow, GeographicalExtendsAgg,
  LabelsAgg, RelationsAgg, TemporalExtendsAgg,
} from '../interfaces/rows';
import {getPreferredLabels} from './label';
import {Settings} from 'common/interfaces/settings';

const convertRelationAgg = (cell: RelationsAgg[]): RelationAbstractSet[] => cell
  .reduce(
    (relationAstractSets: RelationAbstractSet[], relation: RelationsAgg): RelationAbstractSet[] => {
      const predicateIndex = relationAstractSets
        .findIndex(p => (p.relation.id.id === relation.predicate_id && p.relation.id.type === relation.predicate_type));
      if (predicateIndex === -1) {
        relationAstractSets.push({
          objects: [{
            id: {
              id: relation.object_id,
              type: relation.object_type
            }
          }],
          relation: {
            id: {
              id: relation.predicate_id,
              type: relation.predicate_type
            }
          }
        });
      } else {
        relationAstractSets[predicateIndex].objects.push({
          id: {
            id: relation.object_id,
            type: relation.object_type
          }
        });
      }
      return relationAstractSets;
    },
    <RelationAbstractSet[]>[]
  );

const convertLabel = (cell: LabelsAgg): Label => ({
  label: cell.label,
  language: cell.language,
  transliteration: cell.transliteration,
  type: cell.type
});

const convertGeographicalExtend = (cell: GeographicalExtendsAgg): GeographicalExtend => ({
  center: cell.center,
  shape: cell.shape,
  certainty: parseFloat(cell.certainty),
  precision: parseFloat(cell.precision)
});

const convertTemporalExtend = (cell: TemporalExtendsAgg): TemporalExtend => ({
  start: {
    precision: cell.start_precision,
    certainty: cell.start_certainty,
    min: cell.start_min,
    max: cell.start_max
  },
  end: {
    precision: cell.end_precision,
    certainty: cell.end_certainty,
    min: cell.end_min,
    max: cell.end_max
  }
});

// convert the flatish structure a db query returns to the be/fe data interchange object
// TODO later, if structures are more final we form the correct JSON syntax already with SQL command for more effectivity
export const convertRow  = (settings: Settings) => (row: ConceptRow): Concept => {
  const id = {
    id: row.id,
    type: row.type
  };

  const domain = row.domain;

  const labels: Label[] = (row.labels ?? []).map(convertLabel);

  // TODO distinguish between is not geographical at all and has no coordinates
  const geographicalExtends: GeographicalExtend[] = (row.geographicalExtends ?? []).map(convertGeographicalExtend);

  // TODO distinguish between is not temporal at all and has no coordinates
  const temporalExtends: TemporalExtend[] = (row.temporalExtends ?? []).map(convertTemporalExtend);

  const relationsTo: RelationAbstractSet[] = row.relationsTo ? convertRelationAgg(row.relationsTo) : [];
  // TODO relationFrom

  const preferredLabels = getPreferredLabels(labels, settings);

  return  {
    id,
    domain,
    ...preferredLabels,
    labels,
    ...(relationsTo.length && {relationsTo}),
    ...(geographicalExtends.length && {geographicalExtends}),
    ...(temporalExtends.length && {temporalExtends})
  }
};
