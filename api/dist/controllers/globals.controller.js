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
exports.getGlobalValues = void 0;
const express_1 = require("express");
const globals_enums_1 = require("../enums/globals.enums");
const exceptions_1 = require("../util/exceptions");
const globals_1 = require("../models/globals");
const logger_1 = __importDefault(require("../util/logger"));
const application_1 = require("../models/application");
const authentication_1 = require("../middleware/authentication");
const user_enums_1 = require("../enums/user.enums");
const router = express_1.Router();
const getGlobals = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const globals = yield exports.getGlobalValues();
    res.status(200).json({ globals });
});
const getGlobalValues = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield globals_1.Globals.findOneAndUpdate({}, {}, 
    //upsert will update the object, setDefaultsOnInsert will apply the defaults and new will return the updated object instead of the old one
    { upsert: true, setDefaultsOnInsert: true, new: true }).exec();
});
exports.getGlobalValues = getGlobalValues;
const updateApplicationsStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const requestedStatus = req.body.status;
    const status = Object.values(globals_enums_1.ApplicationsStatus).find((status) => status === requestedStatus);
    if (!status)
        next(new exceptions_1.BadRequestException("Invalid status"));
    try {
        const globals = yield globals_1.Globals.findOneAndUpdate({}, { applicationsStatus: status }, { upsert: true, setDefaultsOnInsert: true, new: true }).exec();
        return res.status(200).json({ globals });
    }
    catch (e) {
        logger_1.default.error(e);
        next(e);
    }
});
const makeApplicationsPublic = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const status = req.body.status;
    const globals = yield globals_1.Globals.findOneAndUpdate({}, { applicationsPublic: status }, { upsert: true, setDefaultsOnInsert: true, new: true }).exec();
    yield application_1.Application.aggregate([
        { $addFields: { statusPublic: "$statusInternal" } },
        { $out: "applications" },
    ]);
    res.send(200).json({ globals });
});
router.get("/", getGlobals);
router.post("/status", (req, res, next) => authentication_1.authorizationMiddleware(req, res, next, [user_enums_1.Role.ADMIN]), updateApplicationsStatus);
router.post("/public", (req, res, next) => authentication_1.authorizationMiddleware(req, res, next, [user_enums_1.Role.ADMIN]), makeApplicationsPublic);
//# sourceMappingURL=globals.controller.js.map