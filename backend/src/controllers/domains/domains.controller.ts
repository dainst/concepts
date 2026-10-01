import {Controller, Get} from '@nestjs/common';
import {DbService} from '../../services/db/db.service';
import {Domain} from 'common/interfaces/domain';

@Controller('domains')
export class DomainsController {
  constructor(
    private readonly db: DbService,
  ){
  }

  @Get()
  async get(): Promise<Domain[]> {
    return await this.db.getDomains();
  }
}
