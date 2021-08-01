import sendGrid from "@sendgrid/mail";
import CONFIG from "../config";
import { IUserModel, UserDto } from "../models/User";

// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs

sendGrid.setApiKey(CONFIG.SENDGRID_KEY);

export const sendResetEmail = (user: IUserModel): any => {
  const url =
    CONFIG.NODE_ENV !== "production"
      ? "http://localhost:5000"
      : "https://www.helloworldpurdue.com";

  sendGrid.send({
    templateId: "d-f534db9ac5df4fa5a0dc273095582e9d",
    from: `${CONFIG.ORG_NAME} <${CONFIG.EMAIL}>`,
    to: user.email,
    dynamicTemplateData: {
      name: user.name,
      url,
      token: user.resetPasswordToken,
    },
    mailSettings: {
      sandboxMode: {
        enable: CONFIG.NODE_ENV === "test",
      },
    },
  } as any);
};

export const sendTestMail = (user: IUserModel): any => {
  const url =
    CONFIG.NODE_ENV !== "production"
      ? "http://localhost:5000"
      : "https://www.helloworldpurdue.com";

  sendGrid.send({
    templateId: "d-f534db9ac5df4fa5a0dc273095582e9d",
    from: "helloworldpurdue@gmail.com",
    to: "rhythm.goel.17@gmail.com",
    subject: "Sending with SendGrid is Fun",
    text: "and easy to do anywhere, even with Node.js",
    html: "<strong>and easy to do anywhere, even with Node.js</strong>",
    mailSettings: {
      sandboxMode: {
        enable: CONFIG.NODE_ENV === "test",
      },
    },
  } as any);
};

export const sendAccountCreatedEmail = (user: IUserModel): any => {
  const url =
    CONFIG.NODE_ENV !== "production"
      ? "http://localhost:5000"
      : "https://www.helloworldpurdue.com";

  return sendGrid.send({
    templateId: "d-0bba1a0346c24bd69a46d81d2e950e55",
    from: `${CONFIG.ORG_NAME} <${CONFIG.EMAIL}>`,
    to: user.email,
    dynamicTemplateData: {
      name: user.name,
      url,
      token: user.resetPasswordToken,
    },
    mailSettings: {
      sandboxMode: {
        enable: CONFIG.NODE_ENV === "test",
      },
    },
  } as any);
};

export const sendErrorEmail = (error: Error): any => {
  return sendGrid.send({
    templateId: "d-9fbbdf1f9c90423a80d69b83885eefa8",
    from: `${CONFIG.ORG_NAME} <${CONFIG.EMAIL}>`,
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
        enable: CONFIG.NODE_ENV !== "production",
      },
    },
  } as any);
};

const sendAcceptanceEmails = (users: UserDto[]) => {
  return sendMassEmail("d-316e8d8337dc460eb12148c82a51ba86", users);
};

const sendRejectedEmails = (users: UserDto[]) => {
  return sendMassEmail("d-54335b858a324aa89c948856653bf40e", users);
};

const sendWaitlistedEmails = (users: UserDto[]) => {
  return sendMassEmail("d-29fa0a4a1e064e7383afadc49062273c", users);
};

const sendMassEmail = (templateId: string, users: UserDto[]) => {
  if (users.length)
    return sendGrid.send({
      templateId,
      from: `${CONFIG.ORG_NAME} <${CONFIG.EMAIL}>`,
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
          enable: CONFIG.NODE_ENV === "test",
        },
      },
    });
};
