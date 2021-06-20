import { IUserModel, User } from "../models/User";
import { Role } from "../enums/user.enums";
import { NextFunction, Response, Request } from "express";
import { extractToken, hasPermission } from "../util";
import { decode, verify } from "jsonwebtoken";
import { ObjectId } from "bson";
import logger from "../util/logger";
import CONFIG from "../config/";

export const checkCurrentUserFromToken = async (
  request: Request
): Promise<IUserModel> => {
  const token = extractToken(request);
  if (!token || token == "null" || token == "undefined") return null;
  try {
    verify(token, CONFIG.SECRET);
  } catch (err) {
    logger.info(`Token verification failed: ${err}`);
    return null;
  }
  const payload: any = decode(token);
  if (!payload || !payload._id || !ObjectId.isValid(payload._id)) return null;

  return await User.findById(payload._id).exec();
};
export const authorization = async (
  request: Request,
  roles: Role[]
): Promise<any> => {
  const user = await checkCurrentUserFromToken(request);
  if (!user) throw "You are not logged in!";
  if (!roles.length) return true; //no explicit authorization check required
  if (!roles.some((role) => hasPermission(user, role)))
    throw `Authorization error: ${user.name} does not have enough permissions`;
  return true;
};

export const authorizationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
  roles: Role[]
): Promise<any> => {
  try {
    await authorization(req, roles);
  } catch (e) {
    next(e);
  }
  next();
};

export const logInChecker = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const user = await checkCurrentUserFromToken(req);
  if (!user) next("You are not logged in!");
  req.user = user;
  next();
};
