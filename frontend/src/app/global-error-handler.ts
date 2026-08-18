import {ErrorHandler, Injectable} from '@angular/core';
import {ErrorService} from './services/error.service';
import {AppError, AppErrorType} from './interfaces/error';
import {HttpErrorResponse} from '@angular/common/http';
import {ErrorResponseType, errorResponseTypes} from 'concepts-common/interfaces/api';
import {isAppErrorType} from './functions/error.typeguards';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(
    private readonly es: ErrorService,
  ) {}

  private convertError(error: unknown): AppError {
    if (error instanceof Error) {
      // we found a generic error

      if (('cause' in error) && (error.cause instanceof HttpErrorResponse)) {
        // and it's caused by an api error and wrapped maybe by rxResource or so
        return this.convertError(error.cause);
      }

      return {
        type: 'script-error',
        params: [error.message],
        debug: error.stack ? error.stack.split('\n') : []
      };
    }

    if (error instanceof HttpErrorResponse) {
      // we found an api or http error
      let type: AppErrorType = 'unknown-http-error';
      let params: string[] = [];
      let debug: string[] = [];

      if (('error' in error) && ('type' in error.error) && isAppErrorType(error.error.type)) {
        // we got a proper error body from backend
        type = error.error.type;
        params = error.error?.params ?? [];
        debug = error.error?.debug ?? [];
      } else {
        // we got API error not from the backend but from network, traefik, or whatever
        const apiErrorTypeEntry = Object.entries(errorResponseTypes)
          .find(([_, code]) => code === error.status);
        if (apiErrorTypeEntry && isAppErrorType(apiErrorTypeEntry[0])) {
          // but we can guess the nature of the error by its code
          type = apiErrorTypeEntry[0];
          debug.push(error.message, String(error.url));
        }
      }
      return {type, params, debug};
    }

    return {
      type: 'unknown-error',
      params: [],
      debug: [JSON.stringify(error)]
    };
  }

  handleError(error: unknown): void {
    this.es.add(this.convertError(error));
  }
}
