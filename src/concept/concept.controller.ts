import {Controller, Get} from '@nestjs/common';
import {Concept} from 'common/interfaces/concept';
import {DbService} from '../db/db.service';

@Controller('concept')
export class ConceptController {
  constructor(
    private readonly db: DbService
  ) {
  }

  @Get('/:type/:id')
  async get(type: string, id: string): Promise<Concept> {
    return await this.db.getConcept({type, id});
  }
}
