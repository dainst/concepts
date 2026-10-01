import {Injectable, OnApplicationBootstrap} from '@nestjs/common';
import {DbService} from '../db/db.service';
import {KeycloakAdminService} from '../keycloak-admin/keycloak-admin.service.service';

@Injectable()
export class SyncService implements OnApplicationBootstrap {
  constructor(
    private readonly dbs: DbService,
    private readonly kcs: KeycloakAdminService
  ) {
  }

  async onApplicationBootstrap(): Promise<void> {
    const domains = await this.dbs.getDomains();
    await Promise.all(domains.map(d => this.kcs.createGroup(d.id)));
    console.log('[domains synchronized]');
  }
}
