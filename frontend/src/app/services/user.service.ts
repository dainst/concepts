import {Service} from '@angular/core';
import Keycloak from 'keycloak-js';
import {BehaviorSubject, Subject} from 'rxjs';
import {User} from '../interfaces/user';

@Service()
export class UserService {
  private readonly _authenticated$: Subject<boolean> = new BehaviorSubject<boolean>(false);
  readonly authenticated$ = this._authenticated$.asObservable();

  private readonly keycloak = new Keycloak({
    url: 'http://localhost:8080',
    realm: 'concepts',
    clientId: 'concepts-frontend'
  });

  async init(): Promise<void> {
    try {
      const authenticated = await this.keycloak.init({
        onLoad: 'check-sso',
        pkceMethod: 'S256'
      });
      this._authenticated$.next(authenticated);
      console.log(this.keycloak.tokenParsed);
    } catch (e) {
      this._authenticated$.next(false);
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
    console.log(this.keycloak.tokenParsed);
  }

  async logout(): Promise<void> {
    await this.keycloak.logout();
  }
}
