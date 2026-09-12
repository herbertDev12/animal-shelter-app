import { HttpException, HttpStatus } from '@nestjs/common';

export class WrongUsernameOrPasswordError extends HttpException {
  constructor() {
    super('Wrong username or password', HttpStatus.UNAUTHORIZED);
  }
}

export class UserAlreadyExistsException extends HttpException {
  constructor() {
    super('A user with that email already exists', HttpStatus.CONFLICT);
  }
}
