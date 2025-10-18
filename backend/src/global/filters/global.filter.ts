import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MainAppError } from 'src/app.error';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: MainAppError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // TODO: #8 Integrate with Grafana (Loki) for logs
    const logObject = {
      timestamp: new Date().toISOString(),
      path: request.url,
      trace: exception.httpTrace,
      status: exception.httpCode,
      message: exception.message,
    };

    console.error(logObject);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    });
  }
}
