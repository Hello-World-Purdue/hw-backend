"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendErrorEmail = exports.sendAccountCreatedEmail = exports.sendTestMail = exports.sendResetEmail = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
const config_1 = __importDefault(require("../config"));
// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
mail_1.default.setApiKey(config_1.default.SENDGRID_KEY);
const sendResetEmail = (user) => {
    const url = config_1.default.NODE_ENV !== "production"
        ? "http://localhost:5000"
        : "https://www.helloworldpurdue.com";
    mail_1.default.send({
        templateId: "d-54f38bb5543141f39ea71490d2528ddd",
        from: `${config_1.default.ORG_NAME} <${config_1.default.EMAIL}>`,
        to: user.email,
        dynamicTemplateData: {
            name: user.name,
            url,
            token: user.resetPasswordToken,
        },
        mailSettings: {
            sandboxMode: {
                enable: config_1.default.NODE_ENV === "test",
            },
        },
    });
};
exports.sendResetEmail = sendResetEmail;
const sendTestMail = (user) => {
    const url = config_1.default.NODE_ENV !== "production"
        ? "http://localhost:5000"
        : "https://www.helloworldpurdue.com";
    mail_1.default.send({
        templateId: "d-f534db9ac5df4fa5a0dc273095582e9d",
        from: "helloworldpurdue@gmail.com",
        to: "rhythm.goel.17@gmail.com",
        subject: "Sending with SendGrid is Fun",
        text: "and easy to do anywhere, even with Node.js",
        html: "<strong>and easy to do anywhere, even with Node.js</strong>",
        mailSettings: {
            sandboxMode: {
                enable: config_1.default.NODE_ENV === "test",
            },
        },
    });
};
exports.sendTestMail = sendTestMail;
const sendAccountCreatedEmail = (user) => {
    const url = config_1.default.NODE_ENV !== "production"
        ? "http://localhost:5000"
        : "https://www.helloworldpurdue.com";
    return mail_1.default.send({
        templateId: "d-6b46dc0eb7914b8db689a7952ce11d91",
        from: `${config_1.default.ORG_NAME} <${config_1.default.EMAIL}>`,
        to: user.email,
        dynamicTemplateData: {
            name: user.name,
            url,
            token: user.resetPasswordToken,
        },
        mailSettings: {
            sandboxMode: {
                enable: config_1.default.NODE_ENV === "test",
            },
        },
    });
};
exports.sendAccountCreatedEmail = sendAccountCreatedEmail;
const sendErrorEmail = (error) => {
    return mail_1.default.send({
        templateId: "d-3abae7d5e71b4077aa30e1d710b18fa5",
        from: `${config_1.default.ORG_NAME} <${config_1.default.EMAIL}>`,
        to: "purduehackers@gmail.com",
        dynamicTemplateData: {
            timestamp: new Date(Date.now()).toLocaleString([], {
                timeZone: "America/New_York",
            }),
            error,
            message: error.message.replace(/\n/g, "<br>"),
            stack: error.stack
                ? error.stack.replace(/\n/g, "<br>&emsp;")
                : "No Stack",
        },
        mailSettings: {
            sandboxMode: {
                enable: config_1.default.NODE_ENV !== "production",
            },
        },
    });
};
exports.sendErrorEmail = sendErrorEmail;
const sendAcceptanceEmails = (users) => {
    return sendMassEmail(" d-16c940dfa59c40e7895d2cd96649fb09", users);
};
const sendRejectedEmails = (users) => {
    return sendMassEmail("d-f67f79d3cf8d4796a1dfe83415245cbf", users);
};
const sendWaitlistedEmails = (users) => {
    return sendMassEmail("d-036f9306ee4c40dbbbf1d6436a951713", users);
};
const sendMassEmail = (templateId, users) => {
    if (users.length)
        return mail_1.default.send({
            templateId,
            from: `${config_1.default.ORG_NAME} <${config_1.default.EMAIL}>`,
            personalizations: users.map((user) => ({
                to: user.email,
                // eslint-disable-next-line
                dynamic_template_data: {
                    name: user.name,
                },
            })),
            isMultiple: true,
            mailSettings: {
                sandboxMode: {
                    enable: config_1.default.NODE_ENV === "test",
                },
            },
        });
};
//# sourceMappingURL=email.service.js.map