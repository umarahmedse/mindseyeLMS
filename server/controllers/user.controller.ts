import { Request, Response, NextFunction } from "express";
import userModel, { InterfaceUser } from "../models/user-model";
import AppError from "../utils/AppError";
import catchAsync from "../utils/catchAsync";
import {
  InterfaceActivationRequest,
  InterfaceActivationToken,
  InterfaceLoginUser,
  InterfaceRegistrationBody,
  InterfaceSocialLogin,
  InterfaceUpdateUserInfo,
  InterfaceUpdateUserPassword,
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
import {
  getAllUsers,
  getUserByID,
  updateUserRoleService,
} from "../services/user.service";
import cloudinary from "cloudinary";
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
      return next(new AppError("Please Login To Access This Resource", 400));
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
    req.user = user;
    res.cookie("access_token", accessToken, accessTokenOptions);
    res.cookie("refresh_token", refreshToken, refreshTokenOptions);
    await redis.set(user._id, JSON.stringify(user), "EX", 604800); //7d expire
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
export const socialAuth = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body as InterfaceSocialLogin;

    const user = await userModel.findOne({ email });
    if (user) {
      sendToken(user, 200, res);
    } else {
      const newUser = await userModel.create({ email, name, password });
      sendToken(newUser, 200, res);
    }
  }
);
export const updateUserInfo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email } = req.body as InterfaceUpdateUserInfo;
    const userId = req.user?._id;
    const user = await userModel.findById(userId);
    if (!user) {
      return next(new AppError("User Not Found", 401));
    }
    if (email && user) {
      const userEmail = await userModel.findOne({ email });
      if (userEmail) {
        return next(new AppError("Email already exists", 401));
      }
      user.email = email;
    }
    if (name) {
      user.name = name;
    }
    await user?.save();
    await redis.set(userId, JSON.stringify(user));
    res.status(201).json({
      success: true,
      user,
    });
  }
);
export const updatePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { oldPassword, newPassword } =
      req.body as InterfaceUpdateUserPassword;
    if (!oldPassword || !newPassword) {
      return next(new AppError("New and Old Password Required", 400));
    }
    const userLoggedIn = req?.user;
    const user = await userModel
      .findById(userLoggedIn?._id)
      .select("+password");
    if (!user) {
      return next(new AppError("No User found", 500));
    }
    const isPasswordMatching = await user?.comparePassword(oldPassword);
    console.log(isPasswordMatching);
    if (!isPasswordMatching) {
      return next(new AppError("Invalid old password", 401));
    }
    user.password = newPassword;

    await user?.save();
    await redis.set(req?.user?._id, JSON.stringify(user));
    res.status(201).json({
      success: true,
      user,
    });
  }
);
export const updateProfilePicture = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { avatar } = req.body;
    const userId = req.user?._id;
    const user = await userModel.findById(userId);
    if (!user) {
      return next(new AppError("No User", 403));
    }
    if (avatar && user) {
      if (user?.avatar.public_id) {
        await cloudinary.v2.uploader.destroy(user?.avatar.public_id);
      }
      const myCloud = await cloudinary.v2.uploader.upload(avatar, {
        folder: "avatars",
        width: 150,
      });
      user.avatar = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }
    await user?.save();
    await redis.set(userId, JSON.stringify(user));
    res.status(201).json({
      success: true,
      user,
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
//get all users --- admin only

export const getAllUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    getAllUsers(res);
  }
);

//update user role - only admin

export const updateUserRole = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id, role } = req.body;
    updateUserRoleService(res, id, role);
  }
);

//delete user - only admin

export const deleteUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const user = await userModel.findById(id);
    if (!user) {
      return next(new AppError("No user found", 404));
    }
    await userModel.deleteOne({ id });
    await redis.del(id);
    res.status(201).json({
      success: true,
      message: "user deleted successfully",
    });
  }
);
