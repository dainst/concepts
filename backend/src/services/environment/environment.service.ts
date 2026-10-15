import {Injectable} from '@nestjs/common';
import {Environment} from '../../interfaces/environment';

const truthyStrings = [
  'true', 'TRUE', 'true', 'On', 'on', 'ON', 'yes', 'Yes', 'YES',
  'enabled', 'ENABLED', 'Enabled', '1', 1, true
];

@Injectable()
export class EnvironmentService {
  private readonly e: Environment;
  constructor() {
    this.e = {
      db: {
        database:
          process.env.DATABASE_NAME ?? 'app_db',
        host:
          process.env.DATABASE_HOST ?? 'localhost',
        password:
          process.env.DATABASE_PASSWORD ?? 'secret_password',
        port:
          Number(process.env.DATABASE_PORT) || 5432,
        user:
          process.env.DATABASE_USER ?? 'app_user'
      },
      kc: {
        url: process.env.KEYCLOAK_URL ?? 'http://localhost:8080',
        realm: process.env.KEYCLOAK_REALM ?? 'concepts',
        clientId: process.env.KEYCLOAK_CLIENT_ID ?? 'concepts-backend',
        clientSecret: process.env.CLIENT_SECRET ?? 'development-only-secret'
      },
      cors: !process.env.CORS || truthyStrings.includes(process.env.CORS),
      port: Number(process.env.PORT) || 3000
    };
  }

  get(): Environment {
    return this.e;
  }
}
