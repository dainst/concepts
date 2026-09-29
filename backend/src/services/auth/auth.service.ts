import {Injectable} from '@nestjs/common';
import {createRemoteJWKSet, jwtVerify} from 'jose';
import {fromToken} from '../../functions/user';
import {User} from 'common/interfaces/user';
import {Request} from 'express';

@Injectable()
export class AuthService {

  private readonly issuer = 'http://localhost:8080/realms/concepts';

  private readonly jwks = createRemoteJWKSet(
    new URL(`${this.issuer}/protocol/openid-connect/certs`)
  );

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
