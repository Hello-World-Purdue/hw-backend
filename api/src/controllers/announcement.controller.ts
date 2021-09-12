import { Request, Response, NextFunction, Router } from "express";
import { sendAnnouncement } from "../services/announcement.service";
import { AnnouncementDto, Announcement } from "../models/announcements";
import { sendAnnouncement as sendDiscordAnnouncement } from "../services/discord.service";

const router = Router();

const createAnnouncement = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const ancmnt: AnnouncementDto = req.body;
  const { body, title, label } = ancmnt;

  const announcement = new Announcement({
    body,
    title,
    label,
  });

  try {
    sendDiscordAnnouncement(`${announcement.label}: ${announcement.body}`);
    const ret = await announcement.save();
    sendAnnouncement(ret);
    res.status(200).json({ announcement: ret });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const getAnnouncements = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const announcements = await Announcement.find().lean().exec();
  res.status(200).json({ announcements });
};

//route is /:id
router.post("/", createAnnouncement);
router.get("/", getAnnouncements);
export default router;
