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
Object.defineProperty(exports, "__esModule", { value: true });
exports.userMatches = exports.isAdmin = exports.hasPermission = exports.signToken = exports.extractToken = void 0;
const passport_jwt_1 = require("passport-jwt");
const user_enums_1 = require("../enums/user.enums");
const mongodb_1 = require("mongodb");
const jwt = __importStar(require("jsonwebtoken"));
const env_config_1 = require("../config/env-config");
const extractToken = (req) => passport_jwt_1.ExtractJwt.fromExtractors([
    passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    passport_jwt_1.ExtractJwt.fromBodyField("token"),
    passport_jwt_1.ExtractJwt.fromHeader("token"),
    passport_jwt_1.ExtractJwt.fromUrlQueryParameter("token"),
    (r) => {
        let token;
        if (r && r.cookies)
            token = r.cookies.token;
        return token;
    },
])(req);
exports.extractToken = extractToken;
const signToken = (user, expiresIn = "100000h") => jwt.sign({ _id: user._id, role: user.role }, env_config_1.serverRuntimeConfig.SECRET, {
    expiresIn,
});
exports.signToken = signToken;
const hasPermission = (user, role) => {
    if (!user || !user.role)
        return false;
    return user.role === user_enums_1.Role.ADMIN || user.role === role;
};
exports.hasPermission = hasPermission;
const isAdmin = (user) => exports.hasPermission(user, user_enums_1.Role.ADMIN);
exports.isAdmin = isAdmin;
const userMatches = (user, id, exec) => {
    if (!user)
        return false;
    if (exports.isAdmin(user))
        return true;
    if (exec && exports.hasPermission(user, user_enums_1.Role.EXEC))
        return true;
    return new mongodb_1.ObjectId(user._id).equals(id);
};
exports.userMatches = userMatches;
//# sourceMappingURL=index.js.map