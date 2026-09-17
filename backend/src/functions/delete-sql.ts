import {SqlCommand} from '../interfaces/sql';
import {Relation} from 'common/interfaces/concept';

export const deleteSql = {
  label: (labelId: string): SqlCommand => [`delete from labels where id = $1`, labelId],
  geographicalExtend: (geId: string): SqlCommand => [`delete from geographical_extends where id = $1`, geId],
  temporalExtend: (geId: string): SqlCommand => [`delete from temporal_extends where id = $1`, geId],
  relation: (r: Relation): SqlCommand => [
    `delete from relations where
      subject_type = $1 and subject_id = $2 and
      predicate_type = $3 and predicate_id = $4 and
      object_type = $5 and object_id = $6
    `,
    r.subject.type,
    r.subject.id,
    r.predicate.type,
    r.predicate.id,
    r.object.type,
    r.object.id,
  ]
};
