import {MiddlewareConsumer, Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {StatusController} from './controllers/status/status.controller';
import {DbService} from './services/db/db.service';
import {ConceptController} from './controllers/concept/concept.controller';
import {SearchController} from './controllers/search/search.controller';
import {CacheService} from './services/cache/cache.service';
import {HistoryController} from './controllers/history/history.controller';
import {EnvironmentService} from './services/environment/environment.service';
import {UserController} from './controllers/user/user.controller';
import {AuthService} from './services/auth/auth.service';
import {AuthMiddleware} from './middleware/auth.middleware';
import {DomainController} from './controllers/domain/domain.controller';
import {KeycloakAdminService} from './services/keycloak-admin/keycloak-admin.service.service';
import {DomainsController} from './controllers/domains/domains.controller';
import {SyncService} from './services/sync/sync.service';
import { SettingsService } from './services/settings/settings.service';

@Module({
  imports: [],
  controllers: [AppController, StatusController, ConceptController, SearchController, HistoryController, UserController, DomainController, DomainsController],
  providers: [DbService, CacheService, EnvironmentService, AuthService, KeycloakAdminService, SyncService, SettingsService]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(AuthMiddleware)
      .forRoutes('*');
  }
}
