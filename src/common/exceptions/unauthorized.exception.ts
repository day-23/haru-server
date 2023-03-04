import { HttpException, HttpStatus } from '@nestjs/common';

export class UnauthorizaedException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}
