import { HttpStatus } from '@nestjs/common';
import { ExternalServiceError, MainAppError } from 'src/app.error';

export abstract class MessageError extends MainAppError {
  constructor(
    message: string,
    httpCode: HttpStatus,
    httpTrace: string,
    externalServiceError?: ExternalServiceError,
  ) {
    super(message, httpCode, `MESSAGE_ERROR-${httpTrace}`, externalServiceError);
  }
}

export class InvalidWebhookToken extends MessageError {
  constructor(httpTrace?: string) {
    const completeTrace = httpTrace ? `INVALID_WEBHOOK_TOKEN-${httpTrace}` : 'INVALID_WEBHOOK_TOKEN';
    super('The token received is not equal to the passed one', HttpStatus.BAD_REQUEST, completeTrace);
  }
}

export class UnsupportedMessageReceived extends MessageError {
  constructor(httpTrace?: string) {
    const completeTrace = httpTrace ? `UNSUPPORTED_MESSAGE_RECEIVED-${httpTrace}` : 'INVALID_WEBHOOK_TOKEN';
    super('The message received is not mapped or is malformed', HttpStatus.UNPROCESSABLE_ENTITY, completeTrace);
  }
}
