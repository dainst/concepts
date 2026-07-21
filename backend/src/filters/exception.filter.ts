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
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status;
    let responseContent: ErrorResponse = {
      type: 'internal-server-error'
    };

    if (exception instanceof ApiError) {
      status = HttpStatus.BAD_REQUEST;
      responseContent = {
        type: exception.type,
        params: exception.params,
        debug: exception.stack // TODO only on dev mode
      };
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      responseContent = {
        type: 'unknown-error',
        params: [exception.message],
        debug: exception.stack // TODO only on dev mode
      };
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      responseContent = {
        type: 'internal-server-error',
        params: [exception.name, exception.message],
        debug: exception.stack // TODO only on dev mode
      };
    }

    response
      .status(status)
      .json(responseContent);
  }
}
