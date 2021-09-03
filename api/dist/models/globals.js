"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Globals = void 0;
const mongoose_1 = require("mongoose");
const globals_enums_1 = require("../enums/globals.enums");
const schema = new mongoose_1.Schema({
    applicationsStatus: {
        type: String,
        enum: Object.values(globals_enums_1.ApplicationsStatus),
        default: globals_enums_1.ApplicationsStatus.OPEN,
    },
    applicationsPublic: { type: Boolean, default: false },
    hackingTimeStart: {
        type: Date,
        default: new Date("September 18, 2021 12:00:00 EDT"),
    },
    hackingTimeEnd: {
        type: Date,
        default: new Date("September 19, 2021 12:00:00 EDT"),
    },
    emailsSent: { type: Date, default: null },
}, { timestamps: true });
exports.Globals = mongoose_1.model("Globals", schema, "globals");
//# sourceMappingURL=globals.js.map