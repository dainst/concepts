import {createParamDecorator, ExecutionContext} from '@nestjs/common';
import {User} from 'common/interfaces/user';

export const UserDecorator = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User|null => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);
