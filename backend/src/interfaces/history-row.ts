export interface HistoryRow {
  user_name: string;
  user_email: string;
  timestamp: number;
  event: string;
  value: string;
  comment: string;
  snapshot_id: string | null;
}
