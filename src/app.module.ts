import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { StatusController } from './controllers/status/status.controller';
import { DbService } from './services/db/db.service';
import { ConceptController } from './controllers/concept/concept.controller';
import { SearchController } from './controllers/search/search.controller';

@Module({
  imports: [],
  controllers: [AppController, StatusController, ConceptController, SearchController],
  providers: [DbService],
})
export class AppModule {}
