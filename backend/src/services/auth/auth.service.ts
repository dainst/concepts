import {Injectable} from '@nestjs/common';
import {createRemoteJWKSet, jwtVerify, RemoteJWKSet} from 'jose';
import {fromToken} from '../../functions/user';
import {User} from 'common/interfaces/user';
import {Request} from 'express';
import {EnvironmentService} from '../environment/environment.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly es: EnvironmentService
  ) {
    this.issuer = `${this.es.get().kc.url}/realms/concepts`;
    this.jwks = createRemoteJWKSet(
      new URL(`${this.issuer}/protocol/openid-connect/certs`)
    );
  }

  private readonly issuer: string;
  private readonly jwks: RemoteJWKSet;

  async authenticate(request: Request): Promise<User|null> {
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      return null;
    }

    const token = authorization.substring('Bearer '.length);

    try {
      const {payload} = await jwtVerify(token, this.jwks, {
        issuer: this.issuer
      });

      return payload ? fromToken(payload) : null;
    } catch {
      return null;
    }
  }
}
