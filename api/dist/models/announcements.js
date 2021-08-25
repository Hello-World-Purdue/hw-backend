"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Announcement = exports.AnnouncementDto = void 0;
const mongoose_1 = require("mongoose");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const announcement_enums_1 = require("../enums/announcement.enums");
class AnnouncementDto {
}
__decorate([
    class_transformer_1.Type(() => String),
    class_validator_1.IsNotEmpty({ message: "A title is required" })
], AnnouncementDto.prototype, "title", void 0);
__decorate([
    class_transformer_1.Type(() => String),
    class_validator_1.IsNotEmpty({ message: "The body of the announcement is required" })
], AnnouncementDto.prototype, "body", void 0);
__decorate([
    class_validator_1.IsNotEmpty({ message: "Please provide a label for the announcement" }),
    class_validator_1.IsEnum(announcement_enums_1.AnnouncementLabel, {
        message: "Please provide a valid announcement label",
        each: true,
    })
], AnnouncementDto.prototype, "labels", void 0);
exports.AnnouncementDto = AnnouncementDto;
const schema = new mongoose_1.Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    labels: { type: [String], required: true },
    released: { type: Boolean, default: false },
    slackTS: { type: String, default: "" },
}, { timestamps: true });
exports.Announcement = mongoose_1.model("Announcement", schema, "announcements");
//# sourceMappingURL=announcements.js.map