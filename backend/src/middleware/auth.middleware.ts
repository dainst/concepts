import {Injectable, NestMiddleware} from '@nestjs/common';
import {NextFunction, Request} from 'express';
import {AuthService} from '../services/auth/auth.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private aus: AuthService
  ) {
  }

  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    req['user'] = await this.aus.authenticate(req);
    next();
  }
}
