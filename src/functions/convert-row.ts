import {Label, Relation} from 'common/interfaces/concept';
import {LabelRow, RelationRow} from '../interfaces/rows';

export const convertRow = {
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
  label: (row: LabelRow): Label => ({
    label: row.label,
    language: row.language,
    transliteration: row.transliteration,
    type: row.type
  })
};
