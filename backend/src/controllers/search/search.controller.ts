import {Controller, Get, Query} from '@nestjs/common';
import {DbService} from '../../services/db/db.service';
import {SearchResult} from 'common/interfaces/search';
import {queryParamsToConceptSelector} from '../../functions/query-params';
import {UserDecorator} from '../../decorators/user.decorator';
import {User} from 'common/interfaces/user';

@Controller('search')
export class SearchController {
  constructor(
    private readonly db: DbService
  ) {
  }

  @Get()
  async get(
    @Query() queryParams: Record<string, string>,
    @UserDecorator() user: User | null
  ): Promise<SearchResult> {
    const searchQuery = queryParamsToConceptSelector(queryParams);
    return await this.db.search(searchQuery, user);
  }
}
