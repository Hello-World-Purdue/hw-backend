import { IUserModel, User } from "../models/User";
import { Request, Response, NextFunction, Router } from "express";
import { Application, ApplicationDto } from "../models/application";
import { isValidObjectId } from "mongoose";
import { ObjectId } from "bson";
import {
  authorizationMiddleware,
  logInChecker,
} from "../middleware/authentication";
import { Role } from "../enums/user.enums";
import { hasPermission, userMatches } from "../util";
import Exception, {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../util/exceptions";
import { getGlobalValues } from "./globals.controller";
import { ApplicationsStatus } from "../enums/globals.enums";
import { uploadToStorage } from "../services/storage.service";
import logger from "../util/logger";
import multer from "multer";

const router = Router();

//Authorization
const getAll = async (req: Request, res: Response) => {
  const order: number = req.query.order === "1" ? 1 : -1;
  let sortBy: string = `${req.query.sortBy}` || "createdAt";

  let sortingParamPresent = false;
  User.schema.eachPath((path) => {
    if (path.toUpperCase() === sortBy.toUpperCase()) sortingParamPresent = true;
  });
  if (!sortingParamPresent) sortBy = "createdAt";

  const users = await User.find()
    .sort({ [sortBy]: order })
    .lean()
    .exec();

  res.status(200).json({ users: users });
};

const getCurrentUsersApplication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const app = await Application.findOne({ user: req.user })
    .populate("user")
    .exec();
  if (!app) next(new NotFoundException("No users found!"));
  else res.status(200).send(app);
};

const getUserApplication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id: string = req.params.id;
  if (!isValidObjectId(id)) {
    //return error: the objectId is not valid
    return next(new BadRequestException("The user id is invalid"));
  }
  if (req.user !== id) {
    //return error: not authorizied to see the application
    return next(
      new UnauthorizedException(
        "You do not have enough permissions to view the application"
      )
    );
    return;
  }

  //find the user object
  const user = await User.findById(id).exec();
  if (!user) {
    //return error: the user doesn't exist
    next(new BadRequestException("The user doesn't exist"));
    return;
  }

  const applicationQuery = Application.findOne({
    user: req.user,
  }).populate("user");

  if (hasPermission(user, Role.EXEC)) {
    applicationQuery.select("+statusInternal");
  }

  const application = await applicationQuery.exec();
  res.status(200).send(application);
};

const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  console.log(id);
  if (!ObjectId.isValid(id))
    return next(new BadRequestException("Invalid user id"));
  const user = await User.findById(id).populate("application").exec();

  if (!user) return next(new BadRequestException("User does not exist"));
  res.status(200).send(user);
};

const updateUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;
  const userObject = req.body;
  const currentUser: any = req.user;

  if (!isValidObjectId(id)) {
    //return error: invalid user id
    return next(new BadRequestException("The user id is invalid!"));
  }
  const user = await User.findById(id).exec();
  if (!user) {
    //return error: User not found
    return next(new NotFoundException("The user is not found!"));
  }

  if (`${id}` !== `${currentUser._id}`) {
    //return error: Unauthorized to edit the profile
    return next(
      new UnauthorizedException(
        "You don't have enough permissions to edit this profile"
      )
    );
  }

  if (
    !userObject ||
    !userObject.name ||
    !/([a-zA-Z0-9']+ )+[a-zA-Z0-9']+$/.test(userObject.name)
  ) {
    //return error: Provide your first and last name
    return next(new BadRequestException("Provide your first and last name"));
  }

  //update query
  const result = await User.findByIdAndUpdate(id, { name: userObject.name })
    .lean()
    .exec();

  res.status(200).send({ user: result });
};

const apply = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  if (!ObjectId.isValid(id))
    return next(new BadRequestException("Invalid user ID"));
  const user: IUserModel = await User.findById(id).exec();
  if (!user) return next(new BadRequestException("User not found"));
  const currUser: any = req.user;
  if (!userMatches(currUser, id))
    return next(
      new BadRequestException("You are not authorized to edit this application")
    );
  const globals = await getGlobalValues();
  const closed =
    currUser.role === Role.ADMIN
      ? false
      : globals.applicationsStatus === ApplicationsStatus.CLOSED;

  if (closed)
    next(new UnauthorizedException("Sorry, applications are closed!"));

  const files: Express.Multer.File[] = req.files
    ? (req.files as Express.Multer.File[])
    : [];

  const resume = files.find((file) => file.fieldname === "resume");

  const applicationBody: ApplicationDto = req.body;
  if (resume) {
    try {
      applicationBody.resume = await uploadToStorage(
        resume,
        "resumes",
        currUser
      );
    } catch (error) {
      logger.error("Error uploading resume:", { err: error });
      if (error.code === 429) {
        return next(
          new BadRequestException(
            "You are uploading your resume too fast! Please try again in 5 minutes!"
          )
        );
      } else {
        return next(
          new BadRequestException(
            "Your resume couldn't be uploaded, please try again later"
          )
        );
      }
    }
  }

  const appQuery = Application.findOneAndUpdate(
    { user },
    { ...applicationBody, user },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  ).populate("user");

  try {
    if (hasPermission(currUser, Role.EXEC)) appQuery.select("+statusInternal");
    const app = await appQuery.exec();
    user.application = app;
    await user.save();
    res.status(200).json({ app });
  } catch (error) {
    logger.error(error);
    next(new Exception(error));
  }
};

router.use(logInChecker);

router.get(
  "/",
  (req: Request, res: Response, next: NextFunction) =>
    authorizationMiddleware(req, res, next, [Role.ADMIN, Role.EXEC]),
  getAll
);

router.get(
  "/:id/application",
  (req: Request, res: Response, next: NextFunction) =>
    authorizationMiddleware(req, res, next, []),
  getUserApplication
);

router.get(
  "/application",
  (req: Request, res: Response, next: NextFunction) =>
    authorizationMiddleware(req, res, next, []),
  getCurrentUsersApplication
);

//route is /:id
router.get(
  "/:id(((?!application)[a-zA-Z0-9]+)$)",
  (req: Request, res: Response, next: NextFunction) =>
    authorizationMiddleware(req, res, next, [Role.EXEC]),
  getUserById
);

router.put(
  "/:id",
  (req: Request, res: Response, next: NextFunction) =>
    authorizationMiddleware(req, res, next, []),
  updateUserById
);

router.post(
  "/:id/apply",
  multer().array("resume", 1),
  (req: Request, res: Response, next: NextFunction) =>
    authorizationMiddleware(req, res, next, []),
  apply
);
export default router;
