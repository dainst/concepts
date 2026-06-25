export interface Msg {
  text: string;
}

export interface Status {
  readonly app: string,
  readonly version: string,
  readonly db: {
    readonly version: string;
    readonly status: 'on' | 'off' | 'unknown';
  }
}
