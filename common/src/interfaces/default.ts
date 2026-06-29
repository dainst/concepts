export interface Msg {
  text: string;
}

export interface Status {
  readonly app: string;
  readonly version: string;
  readonly db: DBStatus;
}

export interface DBStatus {
  readonly version: string | null;
  readonly status: 'online' | 'offline' | null;
}
