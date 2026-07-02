import {Controller, Get, Param} from '@nestjs/common';
import {Concept} from 'common/interfaces/concept';
import {DbService} from '../../services/db/db.service';

@Controller('concept')
export class ConceptController {
  constructor(
    private readonly db: DbService
  ) {
  }

  @Get(':type/:id')
  async get(
    @Param('type') type: string,
    @Param('id') id: string
  ): Promise<Concept> {
    return await this.db.getConcept({type, id});
  }
}
