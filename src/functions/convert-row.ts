import {Label, Relation} from 'common/interfaces/concept';
import {LabelRow, RelationRow} from '../interfaces/rows';

export const convertRow = {
  relation: (row: RelationRow): Relation => ({
    subject: {
      id: {
        id: row.subjectId,
        type: row.subjectType,
      },
      title: 'TODO',
      description: 'TODO'
    },
    object: {
      id: {
        id: row.objectId,
        type: row.objectType,
      },
      title: 'TODO',
      description: 'TODO'
    },
    predicate: {
      id: {
        id: row.predicateId,
        type: row.predicateType,
      },
      title: 'TODO',
      description: 'TODO'
    }
  }),
  label: (row: LabelRow): Label => ({
    label: row.label,
    language: row.language,
    transliteration: row.transliteration,
    type: row.labelType
  })
};
