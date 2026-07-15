import {ConceptId, GeographicalExtend, Label, RelationAbstractSet, TemporalExtend} from 'common/interfaces/concept';
import {
  ConceptRow,
  GeographicalExtendsRow,
  LabelRow,
  LabelRowAgg,
  RelationRow,
  TemporalExtendsRow
} from '../interfaces/rows';

export const convertRow = {
  concept: (row: ConceptRow): ConceptId => ({
    id: row.id,
    type: row.type
  }),
  // relationAbstract: (row: RelationRow): RelationAbstractSet => ({
  //   objects: {
  //     id: {
  //       id: row.object_id,
  //       type: row.object_type,
  //     },
  //     title: `Label: ${row.object_id}`,
  //   },
  //   relation: {
  //     id: {
  //       id: row.predicate_id,
  //       type: row.predicate_type,
  //     },
  //     title: `Label: ${row.predicate_id}`,
  //   }
  // }),
  label: (row: LabelRow | LabelRowAgg): Label => ({
    label: row.label,
    language: row.language,
    transliteration: row.transliteration,
    type: row.type
  }),
  geographicalExtend: (row: GeographicalExtendsRow): GeographicalExtend => ({
    center: row.center,
    shape: row.shape,
    certainty: parseFloat(row.certainty),
    precision: parseFloat(row.precision)
  }),
  temporalExtend: (row: TemporalExtendsRow): TemporalExtend => ({
    start: {
      precision: row.start_precision,
      certainty: row.start_certainty,
      min: row.start_min,
      max: row.start_max
    },
    end: {
      precision: row.end_precision,
      certainty: row.end_certainty,
      min: row.end_min,
      max: row.end_max
    }
  })
};
