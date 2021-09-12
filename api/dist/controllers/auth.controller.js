"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const express_1 = require("express");
const logger_1 = __importDefault(require("../util/logger"));
const User_1 = require("../models/User");
const util_1 = require("../util");
const jwt = __importStar(require("jsonwebtoken"));
const application_1 = require("../models/application");
const exceptions_1 = require("../util/exceptions");
const config_1 = __importDefault(require("../config"));
const email_service_1 = require("../services/email.service");
const mongoose_1 = require("mongoose");
const router = express_1.Router();
const signUp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = req.body;
    const password = userData.password;
    const passwordConfirm = userData.passwordConfirm;
    logger_1.default.info(`Sign up request from user ${JSON.stringify(userData)}`);
    if (!password || password.length < 5)
        return next(new exceptions_1.BadRequestException("Password should be larger than 5 characters"));
    if (!passwordConfirm)
        return next(new exceptions_1.BadRequestException("Please confirm your password"));
    if (passwordConfirm !== password)
        return next(new exceptions_1.BadRequestException("Passwords don't match"));
    if (!userData.email.endsWith("purdue.edu"))
        return next(new exceptions_1.BadRequestException("Please register with your Purdue Email"));
    const checkAlreadyRegistered = yield User_1.User.findOne({
        email: userData.email,
    }).exec();
    if (checkAlreadyRegistered)
        return next(new exceptions_1.BadRequestException("An accound already exists with that email!"));
    delete userData.passwordConfirm;
    try {
        const user = new User_1.User(userData);
        yield user.save();
        const userJson = user.toJSON();
        delete userJson.password;
        const token = util_1.signToken(userJson);
        //remove later
        const resetToken = jwt.sign({ id: user._id }, config_1.default.SECRET, {
            expiresIn: "2 days",
        });
        user.resetPasswordToken = resetToken;
        yield user.save();
        logger_1.default.info("User has successfully signed up", user);
        try {
            yield email_service_1.sendAccountCreatedEmail(user);
        }
        catch (e) {
            console.log(e);
            logger_1.default.info(e);
        }
        res.status(200).json({
            user: userJson,
            token,
        });
    }
    catch (e) {
        next(e);
    }
});
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const { email, password } = body;
    const user = yield User_1.User.findOne({ email }, "+password").exec();
    if (!user)
        return next(new exceptions_1.NotFoundException("User not found, login failed!"));
    if (!(yield user.comparePassword(password)))
        return next(new exceptions_1.BadRequestException("Wrong password"));
    const userJson = user.toJSON();
    delete userJson.password;
    if (userJson.application) {
        const app = yield application_1.Application.findById(userJson.application).exec();
        userJson.application = app;
    }
    const token = util_1.signToken(userJson);
    res.status(200).json({
        user: userJson,
        token,
    });
});
const refresh = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    //Renew user's auth token
    let token = util_1.extractToken(req);
    if (!token || token === "null" || token === "undefined")
        return next(new exceptions_1.UnauthorizedException("No token provided"));
    const payload = jwt.decode(token);
    const user = yield User_1.User.findById(payload._id).exec();
    if (!user)
        next(new exceptions_1.UnauthorizedException("User not found"));
    token = util_1.signToken(user);
    logger_1.default.info("Refreshing token");
    res.status(200).json({ user, token });
});
const forgot = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    //TODO: put regex for checking valid emails
    if (!email)
        return next(new exceptions_1.BadRequestException("Please provide a valid email"));
    const user = yield User_1.User.findOne({ email }).exec();
    if (!user)
        return next(new exceptions_1.BadRequestException(`There is no user with the email: ${email}`));
    const token = jwt.sign({ id: user._id }, config_1.default.SECRET, {
        expiresIn: "2 days",
    });
    user.resetPasswordToken = token;
    yield user.save();
    yield email_service_1.sendResetEmail(user);
    res
        .status(200)
        .json({ msg: `A link to reset your password has been sent to: ${email}` });
});
const reset = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { password, passwordConfirm, token } = req.body;
    if (!password || password.length < 5)
        return next(new exceptions_1.BadRequestException("A password longer than 5 characters is required"));
    if (!passwordConfirm)
        return next(new exceptions_1.BadRequestException("Please confirm your password"));
    if (passwordConfirm !== password)
        return next(new exceptions_1.BadRequestException("Passwords did not match"));
    if (!token)
        return next(new exceptions_1.UnauthorizedException("Invalid reset password token"));
    let payload;
    try {
        payload = jwt.verify(token, config_1.default.SECRET);
    }
    catch (error) {
        return next(new exceptions_1.UnauthorizedException("Invalid reset password token"));
    }
    if (!payload)
        return next(new exceptions_1.UnauthorizedException("Invalid reset password token"));
    const { id } = payload;
    if (!id || !mongoose_1.isValidObjectId(id))
        return next(new exceptions_1.BadRequestException("Reset password token corresponds to an invalid user"));
    const user = yield User_1.User.findById(id).select("+resetPasswordToken").exec();
    if (!user)
        return next(new exceptions_1.BadRequestException("Reset password token corresponds to a non existing user"));
    if (`${user.resetPasswordToken}`.localeCompare(`${token}`) !== 0)
        return next(new exceptions_1.UnauthorizedException("Wrong reset password token for this user"));
    user.password = password;
    user.resetPasswordToken = "";
    yield user.save();
    res
        .status(200)
        .json({ user, message: `Successfully changed password for: ${user.name}` });
});
router.post("/signup", signUp);
router.post("/login", login);
router.get("/refresh", refresh);
router.post("/forgot", forgot);
router.post("/reset", reset);
exports.default = router;
//# sourceMappingURL=auth.controller.js.map