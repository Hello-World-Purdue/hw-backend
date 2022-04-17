export default class Exception extends Error {
  constructor(message: string) {
    super();
    this.message = message;
  }

  getCode(): number {
    if (this instanceof BadRequestException) return 400;
    else if (this instanceof NotFoundException) return 404;
    else if (this instanceof UnauthorizedException) return 401;
    return 500;
  }
}

export class BadRequestException extends Exception {}
export class NotFoundException extends Exception {}

export class UnauthorizedException extends Exception {}
