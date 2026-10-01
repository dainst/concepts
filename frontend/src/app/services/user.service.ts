import {Service} from '@angular/core';
import Keycloak from 'keycloak-js';
import {BehaviorSubject, Subject} from 'rxjs';
import {User} from 'concepts-common/interfaces/user';

@Service()
export class UserService {
  private readonly _user$: Subject<User|null> = new BehaviorSubject<User|null>(null);
  readonly user$ = this._user$.asObservable();

  private readonly keycloak = new Keycloak({
    url: 'http://localhost:8080',
    realm: 'concepts',
    clientId: 'concepts-frontend'
  });

  async init(): Promise<void> {
    try {
      await this.keycloak.init({
        onLoad: 'check-sso',
        pkceMethod: 'S256'
      });
      this._user$.next(this.currentUser());
    } catch (e) {
      this._user$.next(null);
      throw e;
    }
  }

  private currentUser(): User | null {
    if (!this.keycloak.authenticated) {
      return null;
    }

    const token = this.keycloak.tokenParsed;

    return {
      id: token?.['sub'] || '',
      username: token?.['preferred_username'],
      name: token?.['name'],
      email: token?.['email'],
      groups: token?.['groups'] ?? [],
      roles: token?.['realm_access']?.['roles'] ?? []
    };
  }

  async login(): Promise<void> {
    await this.keycloak.login();
  }

  async logout(): Promise<void> {
    await this.keycloak.logout();
  }

  async getToken(): Promise<string | undefined> {
    if (!this.keycloak.authenticated) {
      return undefined;
    }

    await this.keycloak.updateToken(30);

    return this.keycloak.token;
  }

  async openProfile(): Promise<void> {
    void await this.keycloak.accountManagement();
  }
}
