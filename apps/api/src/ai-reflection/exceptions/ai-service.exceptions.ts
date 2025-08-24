import { HttpException, HttpStatus } from '@nestjs/common';

export class AIServiceException extends HttpException {
  constructor(
    message: string,
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  ) {
    super(message, status);
  }
}

export class AIAPIException extends HttpException {
  constructor(message: string, statusCode: number) {
    super(`AI API Error: ${message}`, HttpStatus.BAD_GATEWAY);
  }
}
