import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {ApiError} from '../classes/api-error';
import {ErrorResponse, ErrorResponseType} from 'common/interfaces/api';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let type: ErrorResponseType = 'unknown-error'
    let params: string[] = [];
    let debug: string[] = [];

    if (
      typeof exception === 'object'
      && exception != null
      && ('stack' in exception)
      && (typeof exception.stack === 'string')
    ) {
      debug = exception.stack.split('\n');
    }

    if (exception instanceof ApiError) {
      status = HttpStatus.BAD_REQUEST;
      type = exception.type;
      params = exception.params;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      type = 'framework-error';
      params = [String(exception.getStatus()), exception.message];
    } else if (exception instanceof Error) {
      type = 'unpredicted-internal-server-error';
      params = [exception.name, exception.message];
    }

    response
      .status(status)
      .json(<ErrorResponse>{type, params, debug});
  }
}
