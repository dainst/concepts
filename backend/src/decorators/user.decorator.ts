import {createParamDecorator, ExecutionContext} from '@nestjs/common';
import {User} from 'common/interfaces/user';
import {Request} from 'express';
import {ApiError} from '../classes/api-error';

export const UserDecorator = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User|null => {
    const request = ctx.switchToHttp().getRequest<Request>();
    if (request.user) {
      if (!request.user.email) throw new ApiError('invalid-user', ['no mail']);
      if (!request.user.name) throw new ApiError('invalid-user', ['no name']);
      // TODO use typeguard to make validUser
    }
    return request.user;
  }
);
