"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_jwt_1 = require("passport-jwt");
const user_enums_1 = require("../enums/user.enums");
const mongodb_1 = require("mongodb");
const jwt = __importStar(require("jsonwebtoken"));
const env_config_1 = require("../config/env-config");
exports.extractToken = (req) => passport_jwt_1.ExtractJwt.fromExtractors([
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
exports.signToken = (user, expiresIn = "100000h") => jwt.sign({ _id: user._id, role: user.role }, env_config_1.serverRuntimeConfig.SECRET, {
    expiresIn,
});
exports.hasPermission = (user, role) => {
    if (!user || !user.role)
        return false;
    return user.role === user_enums_1.Role.ADMIN || user.role === role;
};
exports.isAdmin = (user) => exports.hasPermission(user, user_enums_1.Role.ADMIN);
exports.userMatches = (user, id, exec) => {
    if (!user)
        return false;
    if (exports.isAdmin(user))
        return true;
    if (exec && exports.hasPermission(user, user_enums_1.Role.EXEC))
        return true;
    return new mongodb_1.ObjectId(user._id).equals(id);
};
//# sourceMappingURL=index.js.map