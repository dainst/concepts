import {Controller, Get} from '@nestjs/common';
import {Status} from 'common/interfaces/default';
import {DbService} from '../../services/db/db.service';

@Controller('status')
export class StatusController {
  constructor(
    private readonly db: DbService
  ) {
  }

  @Get()
  getStatus(): Status {
    const db = this.db.getStatus();
    return {
      app: 'concepts-backend',
      db,
      version: '0.0.0'
    };
  }
}
