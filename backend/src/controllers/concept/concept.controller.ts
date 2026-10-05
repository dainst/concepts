import {Body, Controller, Get, Param, Post, Res, UnauthorizedException, UseGuards} from '@nestjs/common';
import {Concept, ConceptId} from 'common/interfaces/concept';
import {DbService} from '../../services/db/db.service';
import {ApiError} from '../../classes/api-error';
import {HttpAdapterHost} from '@nestjs/core';
import {ExpressAdapter} from '@nestjs/platform-express';
import {AuthGuard} from '../../guards/auth.guard';
import {User} from 'common/interfaces/user';
import {UserDecorator} from '../../decorators/user.decorator';

@Controller('concept')
export class ConceptController {
  constructor(
    private readonly db: DbService,
    private readonly httpAdapterHost: HttpAdapterHost<ExpressAdapter>
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

  @Post()
  @UseGuards(AuthGuard)
  async put(
    @Body() concept: Concept,
    @Res({passthrough: true}) res: Response,
    @UserDecorator() user: User | null
  ): Promise<ConceptId> {
    if (!user) throw new UnauthorizedException();
    const upcertedConceptId = await this.db.upcertConcept(concept, user);
    const updated = (upcertedConceptId.id === concept.id.id) && (upcertedConceptId.type === concept.id.type);
    this.httpAdapterHost.httpAdapter.status(res, updated ? 200 : 201);
    return upcertedConceptId;   // TODO: make it return the whole object
  }
}
