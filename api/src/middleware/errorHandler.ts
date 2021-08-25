import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import Exception from "../util/exceptions";

export const standardErrorHandler: ErrorRequestHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.locals.error = error;
  res.locals.message = error.message;
  let status = 500;
  if (error instanceof Exception) status = error.getCode();
  res.status(status).json({ status, error });
  //TODO: send email to admin if the website is in production
};
