import {Service, signal} from '@angular/core';
import {AppMessage, appMessageTypes} from '../interfaces/error';

@Service()
export class MessageService {
  readonly messages = signal<AppMessage[]>([]);

  add(msg: AppMessage) {
    if (appMessageTypes[msg.type]) {
      console.error(msg);
    }
    const messages = [...this.messages()];
    messages.push(msg);
    queueMicrotask(() => { // important for error from rxResource (and others?)
      this.messages.set([...messages]);
    });
  }

  remove(i: number) {
    const errors = this.messages();
    errors.splice(i, 1);
    this.messages.set([...errors]);
  }
}
