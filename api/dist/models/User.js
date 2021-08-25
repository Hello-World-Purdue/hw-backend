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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.UserDto = void 0;
const bcrypt = __importStar(require("bcrypt"));
const mongoose_1 = require("mongoose");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const user_enums_1 = require("../enums/user.enums");
let UserDto = class UserDto {
    comparePassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            return password && (yield bcrypt.compare(password, this.password));
        });
    }
};
__decorate([
    class_validator_1.IsNotEmpty({ message: "Please provide your first and last name" }),
    class_validator_1.Matches(/([a-zA-Z']+ )+[a-zA-Z']+$/, {
        message: "Please provide your first and last name",
    }),
    class_transformer_1.Expose()
], UserDto.prototype, "name", void 0);
__decorate([
    class_validator_1.IsNotEmpty({ message: "Please provide a valid email address" }),
    class_validator_1.IsEmail({}, { message: "Please provide a valid email address" }),
    class_transformer_1.Expose()
], UserDto.prototype, "email", void 0);
__decorate([
    class_transformer_1.Exclude()
], UserDto.prototype, "password", void 0);
__decorate([
    class_transformer_1.Exclude()
], UserDto.prototype, "resetPasswordToken", void 0);
UserDto = __decorate([
    class_transformer_1.Exclude()
], UserDto);
exports.UserDto = UserDto;
const schema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        select: false,
        required: true,
    },
    role: { type: String, enum: Object.keys(user_enums_1.Role), default: user_enums_1.Role.USER },
    checkedin: { type: Boolean, default: false },
    resetPasswordToken: { type: String, select: false },
    application: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Application",
    },
}, { timestamps: true });
schema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        if (user.isModified("password") || user.isNew) {
            try {
                const salt = yield bcrypt.genSalt(10);
                const hash = yield bcrypt.hash(user.password, salt);
                user.password = hash;
            }
            catch (error) {
                console.error(error);
                throw error;
            }
        }
        next();
    });
});
schema.methods.comparePassword = function (password) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        return password && (yield bcrypt.compare(password, user.password));
    });
};
exports.User = mongoose_1.model("User", schema, "users");
//# sourceMappingURL=User.js.map