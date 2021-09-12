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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const announcement_service_1 = require("../services/announcement.service");
const announcements_1 = require("../models/announcements");
const discord_service_1 = require("../services/discord.service");
const router = express_1.Router();
const createAnnouncement = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const ancmnt = req.body;
    const { body, title, label } = ancmnt;
    const announcement = new announcements_1.Announcement({
        body,
        title,
        label,
    });
    try {
        discord_service_1.sendAnnouncement(`${announcement.label}: ${announcement.body}`);
        const ret = yield announcement.save();
        announcement_service_1.sendAnnouncement(ret);
        res.status(200).json({ announcement: ret });
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
});
const getAnnouncements = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const announcements = yield announcements_1.Announcement.find().lean().exec();
    res.status(200).json({ announcements });
});
//route is /:id
router.post("/", createAnnouncement);
router.get("/", getAnnouncements);
exports.default = router;
//# sourceMappingURL=announcement.controller.js.map