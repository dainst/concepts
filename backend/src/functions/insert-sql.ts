import {uuidv7} from "./uuid";
import {Concept, ConceptId, Label, LabelType} from 'common/interfaces/concept';
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
  ]
};
