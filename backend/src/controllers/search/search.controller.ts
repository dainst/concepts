import {Controller, Get, Query, Param, Post, Body, ParseIntPipe} from '@nestjs/common';
import {DbService} from '../../services/db/db.service';
import {SearchResult} from 'common/interfaces/search';
import {validateConceptSelector} from 'common/functions/selector.validator';
import {removeUndefinedMembers} from '../../functions/remove-undefined-members';
import {queryParamsToConceptSelector} from '../../functions/query-params';

@Controller('search')
export class SearchController {
  constructor(
    private readonly db: DbService,
  ) {
  }

  // @Query('q') q: string,
  // @Query('domain') domain: string,
  // @Query('id') id: string,
  // @Query('type') type: string,

  // @Query('offset') offset: number,

  @Get()
  async get(
    @Query() queryParams: Record<string, string>
  ): Promise<SearchResult> {

    const searchQuery = queryParamsToConceptSelector(queryParams);
    console.log( searchQuery)
    return await this.db.search(searchQuery);
  }
}
