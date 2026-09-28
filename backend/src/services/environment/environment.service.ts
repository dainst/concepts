import {Injectable} from '@nestjs/common';
import {Environment} from '../../interfaces/environment';

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
      cors:
        process.env.CORS ? !!process.env.CORS : true,
      port:
        Number(process.env.PORT) || 3000
    };
  }

  get(): Environment {
    return this.e;
  }
}
