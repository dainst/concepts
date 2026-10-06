import {Service} from '@angular/core';
import Keycloak from 'keycloak-js';
import {BehaviorSubject, Subject} from 'rxjs';
import {User} from 'concepts-common/interfaces/user';
import {AppError} from '../../classes/app-error';
import {UserServiceStatus} from '../interfaces/user-service-status';
import {isUser} from 'concepts-common/functions/user.typeguard';


@Service()
export class UserService {
  private readonly _user$: Subject<User|UserServiceStatus> = new BehaviorSubject<User|UserServiceStatus>('connecting');
  readonly user$ = this._user$.asObservable();

  private readonly keycloak = new Keycloak({
    url: 'http://localhost:8080', // TODO prod
    realm: 'concepts',
    clientId: 'concepts-frontend'
  });

  init():void {
    this.keycloak
      .init({
        onLoad: 'check-sso',
        pkceMethod: 'S256'
      })
      .then(() => {
        this._user$.next(this.currentUser());
      })
      .catch(_ => {
        this._user$.next('error');
        throw new AppError('kc-not-reachable');
      });
  }

  currentUser(): User | UserServiceStatus {
    if (!this.keycloak.authenticated) {
      return 'not-logged-in';
    }

    const token = this.keycloak.tokenParsed;

    return {
      id: token?.['sub'] || '',
      username: token?.['preferred_username'],
      name: token?.['name'],
      email: token?.['email'],
      groups: token?.['groups'] ?? [],
      roles: token?.['realm_access']?.['roles'] ?? [],
      preferredLanguage: token?.['preferredLanguage'] ?? 'deu'
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

    this._user$.next(this.currentUser());

    return this.keycloak.token;
  }

  async openProfile(): Promise<void> {
    void await this.keycloak.accountManagement();
  }

  isUser = isUser;
}
