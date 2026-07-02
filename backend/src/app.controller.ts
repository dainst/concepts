import {Controller, Get} from '@nestjs/common';
import type {Status} from 'common/interfaces/default';
import {DbService} from './services/db/db.service';

@Controller()
export class AppController {
  constructor(
    private readonly db: DbService
  ) {}

  @Get()
  async get(): Promise<Status> {
    const db = this.db.getStatus();
    return {
      app: 'concepts-backend',
      db,
      version: '0.0.0'
    };
  }
}
