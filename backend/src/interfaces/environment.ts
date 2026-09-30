export interface Environment {
  readonly db: {
    readonly user: string;
    readonly password: string;
    readonly host: string;
    readonly port: number;
    readonly database: string;
  }
  readonly kc: {
    readonly url: string;
    readonly realm: string;
    readonly clientId: string;
    readonly clientSecret: string;
  }
  readonly cors: boolean;
  readonly port: number;
}
