import { HttpStatusCode } from 'axios';
import { ExternalServiceError, MainAppError } from 'src/app.error';

abstract class GlobalError extends MainAppError {
  constructor(
    message: string,
    httpCode: HttpStatusCode,
    httpTrace: string,
    externalServiceError?: ExternalServiceError,
  ) {
    super(message, httpCode, httpTrace, externalServiceError);
  }
}

export class ValidationAppError extends GlobalError {
  constructor(message: string) {
    super(message, HttpStatusCode.BadRequest, 'VALIDATION_ERROR');
  }
}

export class UnknownInternalError extends GlobalError {
  constructor(
    message: string = 'Sorry! some error occurred while your request was being processed, try again later',
  ) {
    super(
      message,
      HttpStatusCode.InternalServerError,
      'UNKNOWN_INTERNAL_ERROR',
    );
  }
}
