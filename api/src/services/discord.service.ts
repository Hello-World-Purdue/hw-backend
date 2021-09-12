import Discord from "discord.js";
import CONFIG from "../config";
/*
 * Create a new webhook
 * The Webhooks ID and token can be found in the URL, when you request that URL, or in the response body.
 * https://discord.com/api/webhooks/12345678910/T0kEn0fw3Bh00K
 *                                  ^^^^^^^^^^  ^^^^^^^^^^^^
 *                                  Webhook ID  Webhook Token
 */
const hook = new Discord.WebhookClient(
  CONFIG.DISCORD_WEBHOOK_ID,
  CONFIG.DISCORD_WEBHOOK_TOKEN
);

// Send a message using the webhook
export const sendAnnouncement = (announcement: string): void => {
  hook
    .send(announcement)
    .then((msg) => console.log("Message sent on discord:", msg))
    .catch((e) => console.error("Discord Error:", e));
};
