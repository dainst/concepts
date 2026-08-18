import {Component, computed, effect, inject, signal} from '@angular/core';
import {ErrorService} from '../../services/error.service';
import {NgbAlert} from '@ng-bootstrap/ng-bootstrap';
import {AppError, AppErrorType} from '../../interfaces/error';

const errorMessage: {[key in AppErrorType]: (params: string[]) => string} = {
  "framework-error": p => `Server Error: ${p[0]}`,
  "internal-server-error": p => `Internal Server Error: ${p[0]}`,
  "not-found": p => `Not Found: ${p[0]}`,
  "script-error": p => `Internal Error: ${p[0]}`,
  "unknown-error": p => `Unknown Error: ${p[0]}`,
  "unknown-http-error": p => `Network Error: ${p[0]}`,
  "unpredicted-internal-server-error": p => `Internal Server Error: ${p[0]}`,
}


@Component({
  selector: 'error-component',
  imports: [
    NgbAlert
  ],
  templateUrl: './error.component.html',
  styleUrl: './error.component.css',
})
export class ErrorComponent {
  protected readonly es = inject(ErrorService);
  protected readonly errors = computed(
    () => this.es.errors()
      .map(error => ({error, message: errorMessage[error.type](error.params ?? [])}))
  );
}
