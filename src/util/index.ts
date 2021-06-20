import { Request } from "express";
import { ExtractJwt } from "passport-jwt";
import { IUserModel } from "../models/User";
import { Role } from "../enums/user.enums";
import { ObjectId } from "mongodb";
import * as jwt from "jsonwebtoken";
import { serverRuntimeConfig as CONFIG } from "../config/env-config";
export const extractToken = (req: Request): any =>
  ExtractJwt.fromExtractors([
    ExtractJwt.fromAuthHeaderAsBearerToken(),
    ExtractJwt.fromBodyField("token"),
    ExtractJwt.fromHeader("token"),
    ExtractJwt.fromUrlQueryParameter("token"),
    (r: Request) => {
      let token: string;
      if (r && r.cookies) token = r.cookies.token;
      return token;
    },
  ])(req);

export const signToken = (user: IUserModel, expiresIn = "100000h"): string =>
  jwt.sign({ _id: user._id, role: user.role }, CONFIG.SECRET, {
    expiresIn,
  });

export const hasPermission = (user: IUserModel, role: Role): boolean => {
  if (!user || !user.role) return false;
  return user.role === Role.ADMIN || user.role === role;
};

export const isAdmin = (user: IUserModel): boolean =>
  hasPermission(user, Role.ADMIN);

export const userMatches = (
  user: IUserModel,
  id: ObjectId | string,
  exec?: boolean
): boolean => {
  if (!user) return false;
  if (isAdmin(user)) return true;
  if (exec && hasPermission(user, Role.EXEC)) return true;
  return new ObjectId(user._id).equals(id);
};
