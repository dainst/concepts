import {ConceptHistoryEvent} from 'common/interfaces/concept-history';
import {HistoryRow} from '../interfaces/history-row';
import {isConceptHistoryEventType} from 'common/functions/concept-history.typeguards';
import {ApiError} from '../classes/api-error';

export const convertHistoryRow  = (row: HistoryRow): ConceptHistoryEvent => {
  if (!isConceptHistoryEventType(row.event)) throw new ApiError('internal-server-error', [`Unknown event type: '${row.event}'`], row);
  return {
    userId: row.user_id,
    userName: row.user_name,
    event: row.event,
    value: row.value,
    comment: row.comment,
    timestamp: Number(row.timestamp)
  };
}
