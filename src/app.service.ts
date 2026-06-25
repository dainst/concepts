import { Injectable } from '@nestjs/common';
import { Status} from 'common/interfaces/default';
import { Client } from 'pg';

@Injectable()
export class AppService {
  async getStatus(): Promise<Status> {

    const client = new Client({
      user: 'app_user',
      password: 'secret_password',
      host: 'localhost',
      port: 5334,
      database: 'app_db',
    });


    const eamon = await client.query('select * from meta');
    console.log(eamon);

    return {
      app: 'concepts-backend',
      db: {
        status: 'unknown',
        version: '0.0.0'
      },
      version: '0.0.0'
    };
  }
}
