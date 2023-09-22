import { Request, Response, NextFunction } from "express";
import catchAsync from "./catchAsync";
import AppError from "./AppError";
import jwt, { JwtPayload } from "jsonwebtoken";
import redis from "./redis";
export const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const access_token = req.cookies.access_token;
    if (!access_token) {
      return next(
        new AppError("Not Logged In , Resource Access Forbidden", 401)
      );
    }
    const decoded = jwt.verify(
      access_token,
      process.env.ACCESS_TOKEN as string
    ) as JwtPayload;
    if (!decoded) {
      return next(new AppError("Session Is Not Valid", 401));
    }
    const user = await redis.get(decoded.id);
    if (!user) {
      return next(new AppError("User not found", 401));
    }
    req.user = JSON.parse(user);
    next();
  }
);
export const restrictTo =
  (...roles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role || "")) {
      return next(new AppError("UnAuthorized Access To Resource", 401));
    }
    next();
  };
//3:42:28
