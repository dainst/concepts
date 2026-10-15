import {Injectable, OnModuleInit} from '@nestjs/common';
import {EnvironmentService} from '../environment/environment.service';
import KcAdminClient from '@keycloak/keycloak-admin-client';
import {getErrorMessage} from '../../functions/error';

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
    await this.connect();
  }

  private async connect(retries: number = 5): Promise<void> {
    try {
      await this.client.auth({
        grantType: 'client_credentials',
        clientId: this.es.get().kc.clientId,
        clientSecret: this.es.get().kc.clientSecret
      });
      console.log('[KC] connected');
    } catch (e) {
      console.error(`[KC] Failed to connect (attempt ${6 - retries}):`, getErrorMessage(e));
      if (retries) return new Promise(resolve => {
        setTimeout(
          () => {
            void this.connect(retries - 1).then(resolve);
          },
          10000
        );
      });

      console.error(e);
      // TODO on prod die
    }
  }

  async createGroup(name: string): Promise<void> {
    const groups = await this.client.groups.find({search: name});
    if (groups.some(g => g.name === name)) return;
    await this.client.groups.create({name});
  }

  async deleteGroup(id: string): Promise<void> {
    await this.client.groups.del({id});
  }
}
