"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const class_validator_1 = require("class-validator");
// import { IUserModel } from "./user";
const class_transformer_1 = require("class-transformer");
const app_enums_1 = require("../enums/app.enums");
const isNotEmpty = (obj, val) => val !== "" && val !== null && val !== undefined;
class ApplicationDto {
}
__decorate([
    class_validator_1.IsNotEmpty({ message: "Please provide a valid gender" }),
    class_validator_1.IsEnum(app_enums_1.Gender, { message: "Please provide a valid gender" })
], ApplicationDto.prototype, "gender", void 0);
__decorate([
    class_validator_1.IsNotEmpty({ message: "Please provide a valid ethnicity" }),
    class_validator_1.IsEnum(app_enums_1.ethnicities, { message: "Please provide a valid ethnicity" })
], ApplicationDto.prototype, "ethnicity", void 0);
__decorate([
    class_validator_1.IsNotEmpty({ message: "Please provide a valid class year" }),
    class_validator_1.IsEnum(app_enums_1.ClassYear, { message: "Please provide a valid class year" })
], ApplicationDto.prototype, "classYear", void 0);
__decorate([
    class_validator_1.IsNotEmpty({ message: "Please provide a valid graduation year" }),
    class_transformer_1.Type(() => Number),
    class_validator_1.IsNumber({}, { message: "Graduation year must be a number" }),
    class_validator_1.IsIn(app_enums_1.gradYears, { message: "Please provide a valid graduation year" })
], ApplicationDto.prototype, "graduationYear", void 0);
__decorate([
    class_validator_1.IsNotEmpty({ message: "Please provide a valid class major" }),
    class_validator_1.IsEnum(app_enums_1.Major, { message: "Please provide a valid class major" })
], ApplicationDto.prototype, "major", void 0);
__decorate([
    class_validator_1.IsNotEmpty({ message: "Please provide a valid referral" }),
    class_validator_1.IsEnum(app_enums_1.Referral, { message: "Please provide a valid referral" })
], ApplicationDto.prototype, "referral", void 0);
__decorate([
    class_transformer_1.Type(() => Number),
    class_validator_1.IsNumber({}, { message: "Please provide a valid hackathon number" })
], ApplicationDto.prototype, "hackathons", void 0);
__decorate([
    class_validator_1.IsNotEmpty({ message: "Please provide a valid shirt size" }),
    class_validator_1.IsEnum(app_enums_1.ShirtSize, { message: "Please provide a valid shirt size" })
], ApplicationDto.prototype, "shirtSize", void 0);
__decorate([
    class_validator_1.ValidateIf(isNotEmpty),
    class_validator_1.IsUrl({}, { message: "Please provide a valid website URL" })
], ApplicationDto.prototype, "website", void 0);
__decorate([
    class_validator_1.IsNotEmpty({ message: "Please provide an answer" }),
    class_validator_1.MinLength(1, { message: "Please provide an answer" }),
    class_validator_1.MaxLength(500, { message: "Your answer must be less than 500 characters" })
], ApplicationDto.prototype, "answer1", void 0);
__decorate([
    class_validator_1.IsNotEmpty(),
    class_validator_1.MinLength(1, { message: "Please provide an answer" }),
    class_validator_1.MaxLength(500, { message: "Your answer must be less than 500 characters" })
], ApplicationDto.prototype, "answer2", void 0);
exports.ApplicationDto = ApplicationDto;
const schema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    gender: { type: String, required: true, enum: Object.values(app_enums_1.Gender) },
    ethnicity: { type: String, required: true, enum: app_enums_1.ethnicities },
    classYear: {
        type: String,
        required: true,
        enum: Object.values(app_enums_1.ClassYear),
    },
    graduationYear: { type: Number, required: true },
    major: { type: String, required: true, enum: Object.values(app_enums_1.Major) },
    referral: {
        type: String,
        required: true,
        enum: Object.values(app_enums_1.Referral),
    },
    hackathons: { type: Number, default: 0 },
    shirtSize: {
        type: String,
        required: true,
        enum: Object.values(app_enums_1.ShirtSize),
    },
    dietaryRestrictions: { type: String, default: "" },
    website: { type: String, default: "" },
    answer1: { type: String, required: true },
    answer2: { type: String, required: true },
    resume: { type: String, default: "" },
    statusPublic: {
        type: String,
        default: app_enums_1.Status.PENDING,
        enum: Object.values(app_enums_1.Status),
    },
    statusInternal: {
        type: String,
        default: app_enums_1.Status.PENDING,
        enum: Object.values(app_enums_1.Status),
        select: false,
    },
}, { timestamps: true });
exports.Application = mongoose_1.model("Application", schema, "applications");
//# sourceMappingURL=application.js.map