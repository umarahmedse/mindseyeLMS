import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";
import catchAsync from "../utils/catchAsync";
import { generateLast12MontsData } from "../utils/analyticsGenerator";
import userModel from "../models/user-model";
import courseModel from "../models/course-model";
import orderModel from "../models/order-model";

// get users-analytics
export const getUserAnalytics = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await generateLast12MontsData(userModel);
    res.status(201).json({
      success: true,
      message: "Users analytics",
      users,
    });
  }
);

// get courses-analytics
export const getCoursesAnalytics = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const courses = await generateLast12MontsData(courseModel);
    res.status(201).json({
      success: true,
      message: "Courses analytics",
      courses,
    });
  }
);

// get orders-analytics
export const getOrderAnalytics = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const orders = await generateLast12MontsData(orderModel);
    res.status(201).json({
      success: true,
      message: "Orders analytics",
      orders,
    });
  }
);
