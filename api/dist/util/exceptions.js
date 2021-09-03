"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthorizedException = exports.NotFoundException = exports.BadRequestException = void 0;
class Exception extends Error {
    constructor(message) {
        super();
        this.message = message;
    }
    getCode() {
        if (this instanceof BadRequestException)
            return 400;
        else if (this instanceof NotFoundException)
            return 404;
        else if (this instanceof UnauthorizedException)
            return 401;
        return 500;
    }
}
exports.default = Exception;
class BadRequestException extends Exception {
}
exports.BadRequestException = BadRequestException;
class NotFoundException extends Exception {
}
exports.NotFoundException = NotFoundException;
class UnauthorizedException extends Exception {
}
exports.UnauthorizedException = UnauthorizedException;
//# sourceMappingURL=exceptions.js.map