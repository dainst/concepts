import {ConceptId, GeographicalExtend, Label, Relation} from 'common/interfaces/concept';
import {ConceptRow, GeographicalExtendsRow, LabelRow, LabelRowAgg, RelationRow} from '../interfaces/rows';

export const convertRow = {
  concept: (row: ConceptRow): ConceptId => ({
    id: row.id,
    type: row.type
  }),
  relation: (row: RelationRow): Relation => ({
    subject: {
      id: {
        id: row.subject_id,
        type: row.subject_type,
      },
      title: 'TODO',
      description: 'TODO'
    },
    object: {
      id: {
        id: row.object_id,
        type: row.object_type,
      },
      title: 'TODO',
      description: 'TODO'
    },
    predicate: {
      id: {
        id: row.predicate_id,
        type: row.predicate_type,
      },
      title: 'TODO',
      description: 'TODO'
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
