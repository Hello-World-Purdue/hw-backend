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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTestMail = exports.sendWaitlistedEmails = exports.sendRejectedEmails = exports.sendAcceptanceEmails = exports.sendErrorEmail = exports.sendAccountCreatedEmail = exports.sendResetEmail = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
const config_1 = __importDefault(require("../config"));
const config_2 = __importDefault(require("../config"));
// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
mail_1.default.setApiKey(config_2.default.SENDGRID_KEY);
const sendResetEmail = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const url = config_1.default.BASE_URL;
    try {
        yield mail_1.default.send({
            templateId: "d-54f38bb5543141f39ea71490d2528ddd",
            from: `${config_2.default.EMAIL}`,
            personalizations: [
                {
                    to: [
                        {
                            email: user.email,
                        },
                    ],
                    dynamic_template_data: {
                        name: user.name,
                        url: `${url}/auth/reset?token=${user.resetPasswordToken}`,
                        token: user.resetPasswordToken,
                    },
                },
            ],
            mailSettings: {
                sandboxMode: {
                    enable: config_2.default.NODE_ENV === "test",
                },
            },
        });
    }
    catch (e) {
        console.log(e.response.body.errors);
    }
});
exports.sendResetEmail = sendResetEmail;
const sendAccountCreatedEmail = (user) => {
    const url = config_1.default.BASE_URL;
    return mail_1.default.send({
        templateId: "d-6b46dc0eb7914b8db689a7952ce11d91",
        from: `${config_2.default.EMAIL}`,
        personalizations: [
            {
                to: [
                    {
                        email: user.email,
                    },
                ],
                dynamic_template_data: {
                    name: user.name,
                    url: `${url}/auth/reset?token=${user.resetPasswordToken}`,
                },
            },
        ],
        mailSettings: {
            sandboxMode: {
                enable: config_2.default.NODE_ENV === "test",
            },
        },
    });
};
exports.sendAccountCreatedEmail = sendAccountCreatedEmail;
const sendErrorEmail = (error) => {
    return mail_1.default.send({
        templateId: "d-3abae7d5e71b4077aa30e1d710b18fa5",
        from: `${config_2.default.EMAIL}`,
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
                enable: config_2.default.NODE_ENV !== "production",
            },
        },
    });
};
exports.sendErrorEmail = sendErrorEmail;
const sendAcceptanceEmails = (users) => {
    return sendMassEmail(" d-16c940dfa59c40e7895d2cd96649fb09", users);
};
exports.sendAcceptanceEmails = sendAcceptanceEmails;
const sendRejectedEmails = (users) => {
    return sendMassEmail("d-f67f79d3cf8d4796a1dfe83415245cbf", users);
};
exports.sendRejectedEmails = sendRejectedEmails;
const sendWaitlistedEmails = (users) => {
    return sendMassEmail("d-036f9306ee4c40dbbbf1d6436a951713", users);
};
exports.sendWaitlistedEmails = sendWaitlistedEmails;
const sendMassEmail = (templateId, users) => {
    if (users.length)
        return mail_1.default.send({
            templateId: templateId,
            from: `${config_2.default.EMAIL}`,
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
                    enable: config_2.default.NODE_ENV === "test",
                },
            },
        });
};
const sendTestMail = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const url = config_2.default.NODE_ENV !== "production"
        ? "http://localhost:5000"
        : "https://www.helloworldpurdue.com";
    const ret = yield mail_1.default.send({
        from: "helloworldpurdue@gmail.com",
        to: "rhythm.goel.17@gmail.com",
        subject: "Sending with SendGrid is Fun",
        text: "and easy to do anywhere, even with Node.js",
        html: "<strong>and easy to do anywhere, even with Node.js</strong>",
        mailSettings: {
            sandboxMode: {
                enable: config_2.default.NODE_ENV === "test",
            },
        },
    });
    console.log(ret);
});
exports.sendTestMail = sendTestMail;
//# sourceMappingURL=email.service.js.map