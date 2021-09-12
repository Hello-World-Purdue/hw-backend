import { Announcement, IAnnouncementModel } from "../models/announcements";
import ws from "ws";

let conn: any;
export const setUpAnnouncements = (server: any) => {
  const wss = new ws.Server({ server: server });

  wss.on("connection", function connection(ws) {
    conn = ws;
    console.log("A new client connected for announcements.");
    ws.on("message", async function incoming(message) {
      console.log("received: %s", message);
      // ws.send(message);
      // const announcement = new Announcement(message);
      // await announcement.save();
    });
  });
};

export const sendAnnouncement = async (
  ancmnt: IAnnouncementModel
): Promise<any> => {
  console.log(ancmnt);
  conn.send(JSON.stringify(ancmnt));
};
