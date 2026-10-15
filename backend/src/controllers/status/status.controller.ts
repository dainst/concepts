import {Controller, Get} from '@nestjs/common';
import {Status} from 'common/interfaces/default';
import {DbService} from '../../services/db/db.service';
import packageJson from '../../../package.json';

@Controller()
export class StatusController {
  constructor(
    private readonly db: DbService
  ) {
  }

  @Get()
  @Get('status')
  getStatus(): Status {
    const db = this.db.getStatus();
    return {
      app: packageJson['name'],
      db,
      version: packageJson['version']
    };
  }
}
