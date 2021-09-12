import { Announcement, IAnnouncementModel } from "../models/announcements";
import ws from "ws";
import logger from "../util/logger";

let wss: ws.Server;
export const setUpAnnouncements = (server: any) => {
  wss = new ws.Server({ server: server });

  wss.on("connection", function connection(ws) {
    console.log("A new client connected for announcements.");
    ws.on("message", async function incoming(message) {
      logger.info("received: %s", message);
    });
  });
};

export const sendAnnouncement = async (
  ancmnt: IAnnouncementModel
): Promise<any> => {
  console.log(ancmnt);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN)
      client.send(JSON.stringify(ancmnt));
  });
};
