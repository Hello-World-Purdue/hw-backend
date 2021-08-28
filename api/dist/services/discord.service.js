"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = __importDefault(require("discord.js"));
const config_1 = __importDefault(require("../config"));
/*
 * Create a new webhook
 * The Webhooks ID and token can be found in the URL, when you request that URL, or in the response body.
 * https://discord.com/api/webhooks/12345678910/T0kEn0fw3Bh00K
 *                                  ^^^^^^^^^^  ^^^^^^^^^^^^
 *                                  Webhook ID  Webhook Token
 */
const hook = new discord_js_1.default.WebhookClient(config_1.default.DISCORD_WEBHOOK_ID, config_1.default.DISCORD_WEBHOOK_TOKEN);
// Send a message using the webhook
exports.sendAnnouncement = (announcement) => {
    hook.send(announcement);
};
//# sourceMappingURL=discord.service.js.map