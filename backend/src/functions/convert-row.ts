import {ConceptId, GeographicalExtend, Label, RelationAbstract} from 'common/interfaces/concept';
import {ConceptRow, GeographicalExtendsRow, LabelRow, LabelRowAgg, RelationRow} from '../interfaces/rows';

export const convertRow = {
  concept: (row: ConceptRow): ConceptId => ({
    id: row.id,
    type: row.type
  }),
  relationAbstract: (row: RelationRow): RelationAbstract => ({
    object: {
      id: {
        id: row.object_id,
        type: row.object_type,
      },
      title: `Label: ${row.object_id}`,
    },
    predicate: {
      id: {
        id: row.predicate_id,
        type: row.predicate_type,
      },
      title: `Label: ${row.predicate_id}`,
    }
  }),
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
  })
};
