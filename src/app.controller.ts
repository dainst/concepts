import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import type { Msg } from 'common/interfaces/default';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): Msg {
    return this.appService.getHello();
  }
}
