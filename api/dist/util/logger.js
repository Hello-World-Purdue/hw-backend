"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const myformat = winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp(), winston_1.default.format.align(), winston_1.default.format.printf((info) => ` \u001b[33m${info.timestamp}\u001b[0m ${info.level}: ${info.message}`));
const options = {
    transports: [
        new winston_1.default.transports.Console({
            level: process.env.NODE_ENV === "production" ? "error" : "debug",
            format: myformat,
        }),
        new winston_1.default.transports.File({ filename: "debug.log", level: "debug" }),
    ],
};
const logger = winston_1.default.createLogger(options);
if (process.env.NODE_ENV !== "production") {
    logger.debug("Logging initialized at debug level");
}
exports.default = logger;
//# sourceMappingURL=logger.js.map