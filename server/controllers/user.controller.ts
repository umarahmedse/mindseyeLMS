import { Request, Response, NextFunction } from "express";
import userModel, { InterfaceUser } from "../models/user-model";
import AppError from "../utils/AppError";
import catchAsync from "../utils/catchAsync";
import {
  InterfaceActivationRequest,
  InterfaceActivationToken,
  InterfaceRegistrationBody,
} from "../utils/interfaces";
import jwt, { Secret } from "jsonwebtoken";
import dotenv from "dotenv";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";
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
//2:46:15
