import { Announcement } from "../models/announcements";
import ws from "ws";

export const setUpAnnouncements = (server: any) => {
  const wss = new ws.Server({ server: server });

  wss.on("connection", function connection(ws) {
    console.log("A new client connected for announcements.");
    ws.on("message", async function incoming(message) {
      console.log("received: %s", message);
      ws.send(message);
      const announcement = new Announcement(message);
      await announcement.save();
    });
  });
};
