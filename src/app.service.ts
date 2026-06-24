import { Injectable } from '@nestjs/common';
import { Msg } from 'common/interfaces/default';

@Injectable()
export class AppService {
  getHello(): Msg {
    return {text: 'Hello World!'};
  }
}
