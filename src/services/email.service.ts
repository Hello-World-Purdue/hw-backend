import sendGrid from "@sendgrid/mail";
import config from "../config";
import CONFIG from "../config";
import { IUserModel, UserDto } from "../models/User";

// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs

sendGrid.setApiKey(CONFIG.SENDGRID_KEY);

export const sendResetEmail = async (user: IUserModel): Promise<any> => {
  const url = config.BASE_URL;

  try {
    await sendGrid.send({
      templateId: "d-d36d0f6625684ce0bcd802c3e0411554",
      from: `${CONFIG.EMAIL}`,
      personalizations: [
        {
          to: [
            {
              email: user.email,
            },
          ],
          dynamic_template_data: {
            name: user.name,
            url: `${url}/reset?token=${user.resetPasswordToken}`,
            token: user.resetPasswordToken,
          },
        },
      ],
      mailSettings: {
        sandboxMode: {
          enable: CONFIG.NODE_ENV === "test",
        },
      },
    } as any);
  } catch (e) {
    console.log(e.response.body.errors);
  }
};

export const sendAccountCreatedEmail = (user: IUserModel): any => {
  const url = config.BASE_URL;

  return sendGrid.send({
    templateId: "d-e590e56fcab347428537618d728aee42",
    from: `${CONFIG.EMAIL}`,
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
        enable: CONFIG.NODE_ENV === "test",
      },
    },
  } as any);
};

export const sendErrorEmail = (error: Error): any => {
  return sendGrid.send({
    templateId: "d-3abae7d5e71b4077aa30e1d710b18fa5",
    from: `${CONFIG.EMAIL}`,
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

export const sendAcceptanceEmails = (users: UserDto[]) => {
  // return sendMassEmail(" d-16c940dfa59c40e7895d2cd96649fb09", users);
  return sendEmails("d-c7abf6b83a0941cb836fa819c7c8325f", users);
};

export const sendRejectedEmails = (users: UserDto[]) => {
  // return sendMassEmail("d-f67f79d3cf8d4796a1dfe83415245cbf", users);
  return sendEmails("d-f67f79d3cf8d4796a1dfe83415245cbf", users);
};

export const sendWaitlistedEmails = (users: UserDto[]) => {
  // return sendMassEmail("d-036f9306ee4c40dbbbf1d6436a951713", users);
  return sendEmails("d-036f9306ee4c40dbbbf1d6436a951713", users);
};

const sendMassEmail = (templateId: string, users: UserDto[]) => {
  if (users.length)
    return sendGrid.send({
      templateId: templateId,
      from: `${CONFIG.EMAIL}`,
      personalizations: users.map((user) => ({
        to: [
          {
            email: user.email,
          },
        ],
        dynamic_template_data: {
          name: user.name,
        },
      })),
      // isMultiple: true,
      mailSettings: {
        sandboxMode: {
          enable: CONFIG.NODE_ENV === "test",
        },
      },
    });
};

const sendEmails = async (templateId: string, users: UserDto[]) => {
  if (users.length) {
    try {
      users.forEach(async (user) => {
        await sendGrid.send({
          templateId: templateId,
          from: `${CONFIG.EMAIL}`,
          personalizations: [
            {
              to: [
                {
                  email: user.email,
                },
              ],
              dynamic_template_data: {
                name: user.name,
              },
            },
          ],
          mailSettings: {
            sandboxMode: {
              enable: CONFIG.NODE_ENV === "test",
            },
          },
        } as any);
      });
    } catch (e) {
      console.log(e);
    }
  }
};
export const sendTestMail = async (user: IUserModel): Promise<any> => {
  const url =
    CONFIG.NODE_ENV !== "production"
      ? "http://localhost:5000"
      : "https://www.helloworldpurdue.com";

  const ret = await sendGrid.send({
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
  console.log(ret);
};
