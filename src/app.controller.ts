import {Controller, Get} from '@nestjs/common';
import {AppService} from './app.service';
import type {Status} from 'common/interfaces/default';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(): Promise<Status> {
    return this.appService.getStatus();
  }
}
