import { NextFunction, Request, Response, Router } from "express";
import logger from "../util/logger";
import { User } from "../models/User";
import { signToken } from "../util";
import { BadRequestException, NotFoundException } from "../util/exceptions";

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
  if (!passwordConfirm) return next("Please confirm your password");
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
  //return next("An account already exists with that email!");

  delete userData.passwordConfirm;

  try {
    const user = new User(userData);
    await user.save();
    const userJson: any = user.toJSON();
    delete userJson.password;
    const token = signToken(userJson);

    logger.info("User has successfully signed up", user);

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

  if (!(await user.comparePassword(password))) return next("Wrong password");

  const userJson: any = user.toJSON();
  delete userJson.password;

  const token = signToken(userJson);
  res.status(200).json({
    user: userJson,
    token,
  });
};

router.post("/signup", signUp);
router.post("/login", login);

export default router;
