import {Controller, Get, UseGuards} from '@nestjs/common';
import {AuthGuard} from '../../guards/auth.guard';
import {User} from 'common/interfaces/user';
import {UserDecorator} from '../../decorators/user.decorator';

@Controller('user')
export class UserController {

  @Get()
  @UseGuards(AuthGuard)
  get(
    @UserDecorator() user: User
  ): User {
    return user;
  }
}
