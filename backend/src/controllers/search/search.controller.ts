import {Controller, Get, Query, Param, Post, Body} from '@nestjs/common';
import {DbService} from '../../services/db/db.service';
import {SearchResult} from 'common/interfaces/search';
import {CacheService} from '../../services/cache/cache.service';
import {ConceptSelector} from 'common/interfaces/select';




@Controller('search')
export class SearchController {
  constructor(
    private readonly db: DbService,
    private readonly cs: CacheService,
  ) {
  }

  @Get(':hash')
  async getSearchHash(
    @Param('hash') hash: string,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
  ) {
    if (!hash) {
      throw new Error('no-hash-given');
    }
    return await this.db.search({selector: {}, limit, offset}, hash);
  }

  @Post()
  async get(
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
    @Body() selector: ConceptSelector = {}
  ): Promise<SearchResult> {
    return await this.db.search({selector, limit, offset});
  }
}
