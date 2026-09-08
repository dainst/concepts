import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  importProvidersFrom,
  ErrorHandler, LOCALE_ID,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import localeDe from '@angular/common/locales/de';

import { routes } from './app.routes';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { GlobalErrorHandler } from './global-error-handler';
import {registerLocaleData} from '@angular/common';

registerLocaleData(localeDe);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    importProvidersFrom(NgbModule),
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler,
    },
    {
      provide: LOCALE_ID,
      useValue: 'de-DE'
    }
  ],
};
