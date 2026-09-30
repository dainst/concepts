import {Body, Controller, Post, UseGuards} from '@nestjs/common';
import {AuthGuard} from '../../guards/auth.guard';
import {Domain} from 'common/interfaces/domain';
import {DbService} from '../../services/db/db.service';
import {KeycloakAdminService} from '../../services/keycloak-admin/keycloak-admin.service.service';

@Controller('domain')
export class DomainController {
  constructor(
    private readonly db: DbService,
    private readonly kcs: KeycloakAdminService
  ){
  }

  @Post()
  // @UseGuards(AuthGuard)
  async post(
    @Body() domain: Domain
  ): Promise<void> {
    // TODO check Rights
    await this.kcs.createGroup(domain.id);
    await this.db.upcertDomain(domain);
  }
}
