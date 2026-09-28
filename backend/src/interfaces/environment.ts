export interface Environment {
  readonly db: {
    readonly user: string;
    readonly password: string;
    readonly host: string;
    readonly port: number;
    readonly database: string;
  }
  readonly cors: boolean;
  readonly port: number;
}
