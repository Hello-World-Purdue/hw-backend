/* eslint-disable */
require("dotenv").config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const env = process.env;
const sharedConfig = {
    PORT: env.PORT || 5000,
    NODE_ENV: env.NODE_ENV || "development",
    TRACKING_ID: env.TRACKING_ID || "my-google-analytics-key",
    VAPID_PUBLIC: env.VAPID_PUBLIC || "my vapid public key",
    ANALYZE: env.ANALYZE === "true",
};
const serverRuntimeConfig = Object.assign({ MONGODB_URI: env.MONGODB_URI || "mongodb://0.0.0.0:27017/HelloWorld", EMAIL: env.EMAIL || "my@email.com", EXPIRES_IN: env.EXPIRES_IN || "7 days", GC_BUCKET: env.GC_BUCKET || "mybucket", GC_PROJECT_ID: env.GC_PROJECT_ID || "myprojectid", GC_KEY_FILE: env.GC_KEY_FILE || "helloworldkey.json", ORG_NAME: env.ORG_NAME || "Hello World", SECRET: env.SECRET || "my-secret", SENDGRID_KEY: env.SENDGRID_KEY || "mysendgridkey", DISCORD_WEBHOOK_ID: env.DISCORD_WEBHOOK_ID || "my discord webhook id", DISCORD_WEBHOOK_TOKEN: env.DISCORD_WEBHOOK_TOKEN || "my discord webhook token", VAPID_PRIVATE: env.VAPID_PRIVATE || "my vapid private key", HEADLESS: !!env.HEADLESS || false, SLACK_TOKEN: env.SLACK_TOKEN || "myslacktoken", SLACK_CHANNEL_ID: env.SLACK_CHANNEL_ID || "announcements", REDIRECT_HTTPS: env.REDIRECT_HTTPS === "true", LOG_LEVEL: env.LOG_LEVEL || "trace", APP_DEBUG: env.APP_DEBUG === "true" }, sharedConfig);
const publicRuntimeConfig = Object.assign({ API_URL: env.API_URL
        ? env.API_URL
        : `http://localhost:${serverRuntimeConfig.PORT}/api`, SENTRY_KEY: env.SENTRY_KEY ? env.SENTRY_KEY : "sentry_key", SENTRY_ENVIRONMENT: env.SENTRY_ENVIRONMENT
        ? env.SENTRY_ENVIRONMENT
        : sharedConfig.NODE_ENV }, sharedConfig);
module.exports = {
    publicRuntimeConfig,
    serverRuntimeConfig,
};
//# sourceMappingURL=env-config.js.map