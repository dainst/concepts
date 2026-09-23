import {uuidv7} from './uuid';
import {
  Concept,
  ConceptId,
  GeographicalExtend,
  Label,
  Relation,
  TemporalExtend
} from 'common/interfaces/concept';
import {ConceptHistoryEventType} from 'common/interfaces/concept-history';
import {SqlCommand, SqlCommandWithId} from '../interfaces/sql';

export const insertSql = {
  concept: (concept: Concept | null): SqlCommandWithId =>
    [
      `insert into concepts (
        id, type, domain_id
      ) values ($1, $2, $3)
      on conflict (id, type) do update set
        domain_id = EXCLUDED.domain_id`,
      concept?.id?.id || uuidv7(),
      concept?.id?.type || 'concepts',
      concept?.domain || 'default'
    ],

  label: (
    conceptId: ConceptId,
    label: Label
  ): SqlCommandWithId => [
    `insert into
      labels (
        id,
        concept_id,
        concept_type,
        type,
        label,
        language,
        transliteration
      ) values ($1, $2, $3, $4, $5, $6, $7)
      on conflict (id, concept_id, concept_type) do update set
        type = EXCLUDED.type,
        label = EXCLUDED.label,
        language = EXCLUDED.language,
        transliteration = EXCLUDED.transliteration
      `,
      label.id ?? uuidv7(),
      conceptId.id,
      conceptId.type,
      label.type,
      label.label,
      label.language,
      label.transliteration
  ],

  conceptHistory: (
    conceptId: ConceptId,
    eventType: ConceptHistoryEventType,
    value: string | null = null,
    comment: string | null = null,
    userId: string = '00000000-0000-0000-0000-000000000000' // TODO real id
  ): SqlCommandWithId => [
    `insert into
      concept_history (id, concept_id, concept_type, event, value, comment, user_id)
    values ($1, $2, $3, $4, $5, $6, $7)`,
    uuidv7(),
    conceptId.id,
    conceptId.type,
    eventType,
    value,
    comment,
    userId
  ],

  snapshot: (
    eventId: string,
    concept: Concept,
    formatVersion: number
  ): SqlCommand => [
    `insert into app_concept_snapshots (event_id, format_version, snapshot) values ($1, $2, $3)`,
    eventId,
    formatVersion,
    JSON.stringify(concept)
  ],

  geographicalExtend: (
    conceptId: ConceptId,
    ge: GeographicalExtend
  ): SqlCommandWithId => [
    `insert into geographical_extends (
      id,
      concept_id,
      concept_type,
      center,
      shape,
      certainty,
      precision
    ) values (
      $1,
      $2,
      $3,
      ST_GeomFromGeoJSON($4),
      ${!!ge.shape ? 'ST_GeomFromGeoJSON($5)' : '$5'},
      $6,
      $7
    ) on conflict (id, concept_id, concept_type) do update set
      center = EXCLUDED.center,
      shape = EXCLUDED.shape,
      certainty = EXCLUDED.certainty,
      precision = EXCLUDED.precision
    `,
    ge.id ?? uuidv7(),
    conceptId.id,
    conceptId.type,
    ge.center,
    ge.shape || null,
    ge.certainty,
    ge.precision
  ],

  temporalExtend: (
    conceptId: ConceptId,
    te: TemporalExtend
  ): SqlCommandWithId => [
    `insert into temporal_extends (
      id,
      concept_id,
      concept_type,
      start_min,
      start_max,
      end_min,
      end_max,
      start_precision,
      end_precision,
      start_certainty,
      end_certainty
    ) values (
      $1,  $2,  $3,  $4,  $5, $6,  $7,  $8,  $9,  $10, $11
    ) on conflict (id, concept_id, concept_type) do update set
      start_min = EXCLUDED.start_min,
      start_max = EXCLUDED.start_max,
      end_min = EXCLUDED.end_min,
      end_max = EXCLUDED.end_max,
      start_precision = EXCLUDED.start_precision,
      end_precision = EXCLUDED.end_precision,
      start_certainty = EXCLUDED.start_certainty,
      end_certainty = EXCLUDED.end_certainty
    `,
    te.id ?? uuidv7(),
    conceptId.id,
    conceptId.type,
    te.start.min,
    te.start.max,
    te.start.precision,
    te.start.certainty,
    te.end.min,
    te.end.max,
    te.end.precision,
    te.end.certainty
  ],

  relation: (
    conceptId: ConceptId,
    r: Relation
  ): SqlCommandWithId => [
    `insert into relations (
      subject_type, subject_id, predicate_type, predicate_id, object_type, object_id
    ) values (
      $1,  $2,  $3,  $4,  $5, $6
    ) on conflict do nothing`,
    conceptId.type,
    conceptId.id,
    r.predicate.type,
    r.predicate.id,
    r.object.type,
    r.object.id
  ]
};
