import {Controller, Get, Param} from '@nestjs/common';
import {DbService} from '../../services/db/db.service';
import {ConceptHistory} from 'common/interfaces/concept-history';

@Controller('history')
export class HistoryController {
  constructor(
    private readonly db: DbService
  ) {
  }

  @Get(':type/:id')
  async get(
    @Param('type') type: string,
    @Param('id') id: string
  ): Promise<ConceptHistory> {
    return await this.db.getConceptHistory(type, id);
  }
}
