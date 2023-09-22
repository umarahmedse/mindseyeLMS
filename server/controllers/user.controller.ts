import { Request, Response, NextFunction } from "express";
import userModel, { InterfaceUser } from "../models/user-model";
import AppError from "../utils/AppError";
import catchAsync from "../utils/catchAsync";
import {
  InterfaceActivationRequest,
  InterfaceActivationToken,
  InterfaceLoginUser,
  InterfaceRegistrationBody,
} from "../utils/interfaces";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import dotenv from "dotenv";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";
import {
  accessTokenOptions,
  refreshTokenOptions,
  sendToken,
} from "../utils/jwt";
import redis from "../utils/redis";
import { getUserByID } from "../services/user.service";
dotenv.config();
//User Registration Functionality
export const registerUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;
    const isExisting = await userModel.findOne({ email });
    if (isExisting) {
      return next(new AppError("user already exists", 400));
    }
    const userData: InterfaceRegistrationBody = { name, email, password };
    const activationToken = createActivationToken(userData);
    const activationCode = activationToken.activationCode;
    const data = {
      user: { name: userData.name },
      activationCode,
    };
    const html = await ejs.renderFile(
      path.join(__dirname, "../mails/activationMail.ejs"),
      data
    );
    try {
      await sendMail({
        email: userData.email,
        subject: "Activate Your Account",
        template: "activationMail.ejs",
        data,
      });
      res.status(200).json({
        status: "success",
        message: "Please Check Your Email For Code",
        activationToken: activationToken.token,
      });
    } catch (err: any) {
      return next(new AppError(err.message, 400));
    }
  }
);
//User Activation Functionality
export const activateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { activation_token, activation_code } =
      req.body as InterfaceActivationRequest;
    const newUser: { user: InterfaceUser; activationCode: string } = jwt.verify(
      activation_token,
      process.env.ACTIVATION_SECRET as string
    ) as { user: InterfaceUser; activationCode: string };
    const { email, name, password } = newUser.user;
    if (newUser.activationCode !== activation_code) {
      return next(new AppError("Invalid Code Provided", 401));
    }
    const isExisting = await userModel.findOne({ email });
    if (isExisting) {
      return next(new AppError("Email already exists", 400));
    }
    const user = await userModel.create({
      email,
      password,
      name,
    });
    res.status(200).json({
      success: true,
    });
  }
);
export const loginUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body as InterfaceLoginUser;
    if (!email || !password) {
      return next(new AppError("Please Provide Email And Password", 401));
    }
    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      return next(new AppError("No User Found", 401));
    }
    const isPasswordMatching = await user.comparePassword(password);
    if (!isPasswordMatching) {
      return next(new AppError("Incorrect Credentials", 401));
    }
    sendToken(user, 200, res);
  }
);
export const logoutUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    redis.del(req.user?._id);
    res.cookie("access_token", "", { maxAge: 1 });
    res.cookie("refresh_token", "", { maxAge: 1 });
    res.status(200).json({
      success: true,
      message: "Logout Successful",
    });
  }
);
export const updateAccessToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refresh_token = req.cookies.refresh_token as string;
    const decoded = jwt.verify(
      refresh_token,
      process.env.REFRESH_TOKEN as string
    ) as JwtPayload;
    if (!decoded) {
      return next(new AppError("Token Refresh Error", 400));
    }
    const session = (await redis.get(decoded.id)) as string;
    if (!session) {
      return next(new AppError("Token Refresh Error", 400));
    }
    const user = JSON.parse(session);
    const accessToken = jwt.sign(
      { id: user._id },
      process.env.ACCESS_TOKEN as string,
      {
        expiresIn: "5m",
      }
    );
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN as string,
      {
        expiresIn: "59m",
      }
    );
    res.cookie("access_token", accessToken, accessTokenOptions);
    res.cookie("refresh_token", refreshToken, refreshTokenOptions);
    res.status(200).json({
      status: "success",
      accessToken,
    });
  }
);

export const getUserInfo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    getUserByID(userId, res);
  }
);
//UTILITY FUNCTIONS
export const createActivationToken = (user: any): InterfaceActivationToken => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
  const token = jwt.sign(
    {
      user,
      activationCode,
    },
    process.env.ACTIVATION_SECRET as Secret,
    { expiresIn: process.env.JWT_EXPIRY }
  );
  return { token, activationCode };
};
