"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.standardErrorHandler = void 0;
const exceptions_1 = __importDefault(require("../util/exceptions"));
const standardErrorHandler = (error, req, res, next) => {
    res.locals.error = error;
    res.locals.message = error.message;
    let status = 500;
    if (error instanceof exceptions_1.default)
        status = error.getCode();
    res.status(status).json({ status, error });
    //TODO: send email to admin if the website is in production
};
exports.standardErrorHandler = standardErrorHandler;
//# sourceMappingURL=errorHandler.js.map