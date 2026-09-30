import {createParamDecorator, ExecutionContext} from '@nestjs/common';
import {User} from 'common/interfaces/user';
import {Request} from 'express';

export const UserDecorator = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User|null => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user;
  }
);
