import dotenv from "dotenv";
import { Response } from "express";
import { InterfaceUser } from "../models/user-model";
import redis from "./redis";
import { InterfaceTokenOptions } from "./interfaces";
export const accessTokenExpires = parseInt(
  process.env.ACCESS_TOKEN_EXPIRES || "300",
  10
);
export const refreshTokenExpires = parseInt(
  process.env.REFRESH_TOKEN_EXPIRES || "1200",
  10
);
export const accessTokenOptions: InterfaceTokenOptions = {
  expires: new Date(Date.now() + accessTokenExpires * 60 * 1000),
  maxAge: accessTokenExpires * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
};

export const refreshTokenOptions: InterfaceTokenOptions = {
  expires: new Date(Date.now() + refreshTokenExpires * 60 * 1000),
  maxAge: refreshTokenExpires * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
};
export const sendToken = (
  user: InterfaceUser,
  statusCode: number,
  res: Response
) => {
  const accessToken = user.signAccessToken();
  const refreshToken = user.signRefreshToken();
  //upload session to redis
  redis.set(user._id, JSON.stringify(user) as any);
  //parse env variables to integrate with fallback values

  if ((process.env.NODE_ENV = "production")) {
    accessTokenOptions.secure = true;
  }

  res.cookie("access_token", accessToken, accessTokenOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenOptions);

  res.status(statusCode).json({
    success: true,
    user,
    accessToken,
  });
};
