import { application, NextFunction, Request, Response, Router } from "express";
import logger from "../util/logger";
import { User } from "../models/User";
import { extractToken, signToken } from "../util";
import * as jwt from "jsonwebtoken";
import { Application, ApplicationDto } from "../models/application";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../util/exceptions";
import CONFIG from "../config";
import {
  sendAccountCreatedEmail,
  sendResetEmail,
  sendTestMail,
} from "../services/email.service";
import { isValidObjectId } from "mongoose";

const router = Router();

const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const userData = req.body;
  const password = userData.password;
  const passwordConfirm = userData.passwordConfirm;
  logger.info(`Sign up request from user ${JSON.stringify(userData)}`);
  if (!password || password.length < 5)
    return next(
      new BadRequestException("Password should be larger than 5 characters")
    );
  if (!passwordConfirm)
    return next(new BadRequestException("Please confirm your password"));
  if (passwordConfirm !== password)
    return next(new BadRequestException("Passwords don't match"));

  if (!userData.email.endsWith("purdue.edu"))
    return next(
      new BadRequestException("Please register with your Purdue Email")
    );

  const checkAlreadyRegistered = await User.findOne({
    email: userData.email,
  }).exec();

  if (checkAlreadyRegistered)
    return next(
      new BadRequestException("An accound already exists with that email!")
    );

  delete userData.passwordConfirm;

  try {
    const user = new User(userData);
    await user.save();
    const userJson: any = user.toJSON();
    delete userJson.password;
    const token = signToken(userJson);

    logger.info("User has successfully signed up", user);
    try {
      await sendAccountCreatedEmail(user);
    } catch (e) {
      console.log(e);
      logger.info(e);
    }

    res.status(200).json({
      user: userJson,
      token,
    });
  } catch (e) {
    next(e);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  const body: { email: string; password: string } = req.body;
  const { email, password } = body;
  const user = await User.findOne({ email }, "+password").exec();
  if (!user)
    return next(new NotFoundException("User not found, login failed!"));

  if (!(await user.comparePassword(password)))
    return next(new BadRequestException("Wrong password"));

  const userJson: any = user.toJSON();
  delete userJson.password;

  if (userJson.application) {
    const app = await Application.findById(userJson.application).exec();
    userJson.status = app.statusPublic;
  }

  const token = signToken(userJson);
  res.status(200).json({
    user: userJson,
    token,
  });
};

const refresh = async (req: Request, res: Response, next: NextFunction) => {
  //Renew user's auth token
  let token = extractToken(req);
  if (!token || token === "null" || token === "undefined")
    return next(new UnauthorizedException("No token provided"));
  const payload: any = jwt.decode(token);
  const user = await User.findById(payload._id).exec();
  if (!user) next(new UnauthorizedException("User not found"));
  token = signToken(user);
  logger.info("Refreshing token");
  res.status(200).json({ user, token });
};

const forgot = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;
  //TODO: put regex for checking valid emails
  if (!email)
    return next(new BadRequestException("Please provide a valid email"));
  const user = await User.findOne({ email }).exec();
  if (!user)
    return next(
      new BadRequestException(`There is no user with the email: ${email}`)
    );
  const token = jwt.sign({ id: user._id }, CONFIG.SECRET, {
    expiresIn: "2 days",
  });
  user.resetPasswordToken = token;
  await user.save();
  await sendResetEmail(user);
  res
    .status(200)
    .json({ msg: `A link to reset your password has been sent to: ${email}` });
};

const reset = async (req: Request, res: Response, next: NextFunction) => {
  const { password, passwordConfirm, token } = req.body;
  if (!password || password.length < 5)
    return next(
      new BadRequestException("A password longer than 5 characters is required")
    );
  if (!passwordConfirm)
    next(new BadRequestException("Please confirm your password"));
  if (passwordConfirm !== password)
    next(new BadRequestException("Passwords did not match"));

  if (!token)
    return next(new UnauthorizedException("Invalid reset password token"));
  let payload: { id: string };
  try {
    payload = jwt.verify(token, CONFIG.SECRET) as any;
  } catch (error) {
    return next(new UnauthorizedException("Invalid reset password token"));
  }
  if (!payload)
    return next(new UnauthorizedException("Invalid reset password token"));
  const { id } = payload;
  if (!id || !isValidObjectId(id))
    next(
      new BadRequestException(
        "Reset password token corresponds to an invalid user"
      )
    );
  const user = await User.findById(id).select("+resetPasswordToken").exec();
  if (!user)
    next(
      new BadRequestException(
        "Reset password token corresponds to a non existing user"
      )
    );
  if (user.resetPasswordToken !== token)
    next(new UnauthorizedException("Wrong reset password token for this user"));
  user.password = password;
  user.resetPasswordToken = "";
  await user.save();
  return `Successfully changed password for: ${user.name}`;
};

router.post("/signup", signUp);
router.post("/login", login);
router.get("/refresh", refresh);
router.post("/forgot", forgot);
router.post("/reset", reset);

export default router;
