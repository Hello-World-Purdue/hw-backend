import { Router, Request, Response, NextFunction } from "express";
import { ApplicationsStatus } from "../enums/globals.enums";
import { BadRequestException } from "../util/exceptions";
import { Globals } from "../models/globals";
import { IGlobalsModel } from "../models/globals";
import logger from "../util/logger";
import { Application } from "../models/application";
import { authorizationMiddleware } from "../middleware/authentication";
import { Role } from "../enums/user.enums";

const router = Router();

const getGlobals = async (req: Request, res: Response, next: NextFunction) => {
  const globals: IGlobalsModel = await Globals.findOneAndUpdate(
    {},
    {},
    //upsert will update the object, setDefaultsOnInsert will apply the defaults and new will return the updated object instead of the old one
    { upsert: true, setDefaultsOnInsert: true, new: true }
  ).exec();
  res.status(200).json({ globals });
};

const updateApplicationsStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestedStatus = req.body.status;
  const status = Object.values(ApplicationsStatus).find(
    (status) => status === requestedStatus
  );
  if (!status) next(new BadRequestException("Invalid status"));
  try {
    const globals: IGlobalsModel = await Globals.findOneAndUpdate(
      {},
      { applicationsStatus: status },
      { upsert: true, setDefaultsOnInsert: true, new: true }
    ).exec();
    return res.status(200).json({ globals });
  } catch (e) {
    logger.error(e);
    next(e);
  }
};

const makeApplicationsPublic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status: boolean = req.body.status;
  const globals: IGlobalsModel = await Globals.findOneAndUpdate(
    {},
    { applicationsPublic: status },
    { upsert: true, setDefaultsOnInsert: true, new: true }
  ).exec();
  await Application.aggregate([
    { $addFields: { statusPublic: "$statusInternal" } },
    { $out: "applications" },
  ]);

  res.send(200).json({ globals });
};

router.get("/", getGlobals);

router.post(
  "/status",
  (req: Request, res: Response, next: NextFunction) =>
    authorizationMiddleware(req, res, next, [Role.ADMIN]),
  updateApplicationsStatus
);

router.post(
  "/public",
  (req: Request, res: Response, next: NextFunction) =>
    authorizationMiddleware(req, res, next, [Role.ADMIN]),
  makeApplicationsPublic
);
