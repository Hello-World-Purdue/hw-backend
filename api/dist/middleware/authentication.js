"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logInChecker = exports.authorizationMiddleware = exports.authorization = exports.checkCurrentUserFromToken = void 0;
const User_1 = require("../models/User");
const util_1 = require("../util");
const jsonwebtoken_1 = require("jsonwebtoken");
const bson_1 = require("bson");
const logger_1 = __importDefault(require("../util/logger"));
const config_1 = __importDefault(require("../config/"));
const exceptions_1 = require("../util/exceptions");
const checkCurrentUserFromToken = (request) => __awaiter(void 0, void 0, void 0, function* () {
    const token = util_1.extractToken(request);
    if (!token || token == "null" || token == "undefined")
        return null;
    try {
        jsonwebtoken_1.verify(token, config_1.default.SECRET);
    }
    catch (err) {
        logger_1.default.info(`Token verification failed: ${err}`);
        return null;
    }
    const payload = jsonwebtoken_1.decode(token);
    if (!payload || !payload._id || !bson_1.ObjectId.isValid(payload._id))
        return null;
    return yield User_1.User.findById(payload._id).exec();
});
exports.checkCurrentUserFromToken = checkCurrentUserFromToken;
const authorization = (request, roles) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield exports.checkCurrentUserFromToken(request);
    if (!user)
        throw "You are not logged in!";
    if (!roles.length)
        return true; //no explicit authorization check required
    if (!roles.some((role) => util_1.hasPermission(user, role)))
        throw `Authorization error: ${user.name} does not have enough permissions`;
    return true;
});
exports.authorization = authorization;
const authorizationMiddleware = (req, res, next, roles) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield exports.authorization(req, roles);
    }
    catch (e) {
        next(new exceptions_1.UnauthorizedException(e));
    }
    next();
});
exports.authorizationMiddleware = authorizationMiddleware;
const logInChecker = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield exports.checkCurrentUserFromToken(req);
    if (!user)
        next(new exceptions_1.UnauthorizedException("You are not logged in!"));
    req.user = user;
    next();
});
exports.logInChecker = logInChecker;
//# sourceMappingURL=authentication.js.map