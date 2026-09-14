import {Body, Controller, Get, Param, Put, Query} from '@nestjs/common';
import {Concept, ConceptId} from 'common/interfaces/concept';
import {DbService} from '../../services/db/db.service';
import {convertConceptRow} from '../../functions/convert-concept-row';
import {ApiError} from '../../classes/api-error';

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
    const c = await this.db.getConcept(type, id);
    if (!c) throw new ApiError('not-found', ['concept', type, id]);
    return c;
  }

  @Put()
  async put(
    @Body() concept: Concept
  ): Promise<ConceptId> {
    return await this.db.updateConcept(concept)
  }
}
