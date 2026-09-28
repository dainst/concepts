import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {StatusController} from './controllers/status/status.controller';
import {DbService} from './services/db/db.service';
import {ConceptController} from './controllers/concept/concept.controller';
import {SearchController} from './controllers/search/search.controller';
import {CacheService} from './services/cache/cache.service';
import {HistoryController} from './controllers/history/history.controller';
import {EnvironmentService} from './services/environment/environment.service';

@Module({
  imports: [],
  controllers: [AppController, StatusController, ConceptController, SearchController, HistoryController],
  providers: [DbService, CacheService, EnvironmentService]
})
export class AppModule {}
