import { Test, TestingModule } from '@nestjs/testing';
import { KeycloakAdminServiceService } from './keycloak-admin.service.service';

describe('KeycloakAdminServiceService', () => {
  let service: KeycloakAdminServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KeycloakAdminServiceService],
    }).compile();

    service = module.get<KeycloakAdminServiceService>(KeycloakAdminServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
