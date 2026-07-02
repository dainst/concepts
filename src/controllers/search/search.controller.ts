import {Controller, Get, Query} from '@nestjs/common';
import {ConceptAbstract} from 'common/interfaces/concept';
import {DbService} from '../../services/db/db.service';

@Controller('search')
export class SearchController {
  constructor(
    private readonly db: DbService
  ) {
  }

  @Get()
  async get(
    @Query('q') q: string,
  ): Promise<ConceptAbstract[]> {
    return this.db.getConceptAbstracts({q});
  }
}
