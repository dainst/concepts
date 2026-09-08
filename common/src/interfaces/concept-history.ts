/**
 * this data structure is not an aspect of history, because
 * - its endpoints are limited to users
 * - you never the history of more than one oject ata a time
 * - it will potentially contain not only the history of the concept but also its labels, extends etc.
 */

export const conceptHistoryEventTypes = [
  'set-status',
  'create',
  'update',
  'edit'
] as const;

export type ConceptHistoryEventType = typeof conceptHistoryEventTypes[number];

export interface ConceptHistoryEvent {
  event: ConceptHistoryEventType;
  value: string;
  comment: string;
  timestamp: number;
  userId: string;
  userName: string;
}

export type ConceptHistory = ConceptHistoryEvent[];
