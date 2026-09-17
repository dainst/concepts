import {Component, computed, effect, inject, signal} from '@angular/core';
import {MessageService} from '../../services/message.service';
import {NgbAlert} from '@ng-bootstrap/ng-bootstrap';
import {AppMessageType, appMessageTypes} from '../../interfaces/error';

const text: {[key in AppMessageType]: (params: string[]) => string} = {
  "invalid-data": p => `Invalid Data: ${p.join(', ')}`,
  "successful-created": p => 'Successfully Created Concept',
  "successful-updated": p => 'Successfully Updated Concept',
  "framework-error": p => `Server Error: ${p[0]}`,
  "internal-server-error": p => `Internal Server Error: ${p[0]}`,
  "not-found": p => `Not Found: ${p[0]}`,
  "script-error": p => `Internal Error: ${p[0]}`,
  "unknown-error": p => `Unknown Error: ${p[0]}`,
  "unknown-http-error": p => `Network Error: ${p[0]}`,
  "unpredicted-internal-server-error": p => `Internal Server Error: ${p[0]}`,
  "db-transaction-error": p => `Could not store in DB: ${p[0]}`
};

const type = (mt: AppMessageType): string => {
  if (appMessageTypes[mt] > 0) return 'danger';
  return 'success';
};

@Component({
  selector: 'message-component',
  imports: [
    NgbAlert
  ],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css',
})
export class MessageComponent {
  protected readonly es = inject(MessageService);
  protected readonly messages = computed(
    () => this.es.messages()
      .map(msg => ({
        msg,
        type: type(msg.type),
        text: text[msg.type](msg.params ?? [])
      }))
  );
}
