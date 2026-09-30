import {Injectable, OnModuleInit} from '@nestjs/common';
import {EnvironmentService} from '../environment/environment.service';
import KcAdminClient from '@keycloak/keycloak-admin-client';

@Injectable()
export class KeycloakAdminService implements OnModuleInit {
  constructor(
    private readonly es: EnvironmentService
  ) {
    this.client = new KcAdminClient({
      baseUrl: this.es.get().kc.url,
      realmName: this.es.get().kc.realm
    });
  }

  private readonly client: KcAdminClient;

  async onModuleInit(): Promise<void> {
    await this.client.auth({
      grantType: 'client_credentials',
      clientId: this.es.get().kc.clientId,
      clientSecret: this.es.get().kc.clientSecret
    });
    console.log('[KC] connected');
  }

  async createGroup(name: string): Promise<void> {
    await this.client.groups.create({name});
  }

  async deleteGroup(id: string): Promise<void> {
    await this.client.groups.del({id});
  }
}
