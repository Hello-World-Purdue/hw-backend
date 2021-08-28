"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const exceptions_1 = __importDefault(require("../util/exceptions"));
exports.standardErrorHandler = (error, req, res, next) => {
    res.locals.error = error;
    res.locals.message = error.message;
    let status = 500;
    if (error instanceof exceptions_1.default)
        status = error.getCode();
    res.status(status).json({ status, error });
    //TODO: send email to admin if the website is in production
};
//# sourceMappingURL=errorHandler.js.map