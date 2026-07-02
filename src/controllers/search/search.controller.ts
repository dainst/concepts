import {Controller, Get, Query} from '@nestjs/common';
import {DbService} from '../../services/db/db.service';
import {SearchResult} from 'common/interfaces/search';

@Controller('search')
export class SearchController {
  constructor(
    private readonly db: DbService
  ) {
  }

  @Get()
  async get(
    @Query('q') q: string,
    @Query('limit') limit: string,
    @Query('offset') offset: string,
  ): Promise<SearchResult> {
    return await this.db.search({
      selector: {
        q: q ?? '*'
      },
      limit: parseInt(limit) || 10,
      offset: parseInt(offset) || 0
    });
  }
}
