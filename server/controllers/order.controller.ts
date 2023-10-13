import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";
import catchAsync from "../utils/catchAsync";
import orderModel, { InterfaceOrder } from "../models/order-model";
import userModel from "../models/user-model";
import courseModel from "../models/course-model";
import notificationModel from "../models/notification-model";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/sendMail";
import { getAllOrderList, newOrder } from "../services/order.service";

//CREATE ORDER
export const createOrder = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { courseId, payment_info } = req.body as InterfaceOrder;
    const user = await userModel.findById(req.user?._id);
    if (!user) {
      return next(new AppError("No such user", 401));
    }
    const courseExists = user.courses.some(
      (course: any) => course._id.toString() === courseId
    );
    if (courseExists) {
      return next(new AppError("User already enrolled in this course", 409));
    }
    const course = await courseModel.findById(courseId);
    if (!course) {
      return next(new AppError("No such course", 401));
    }
    const data: any = {
      courseId: course?._id,
      userId: user?._id,
    };
    const mailData = {
      order: {
        _id: course._id.toString().slice(0, 5),
        name: course.name,
        price: course.price,
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      },
    };
    const html = await ejs.renderFile(
      path.join(__dirname, "../mails/orderConfirmation.ejs"),
      { order: mailData }
    );
    if (user) {
      await sendMail({
        email: user.email,
        subject: "Order Confirmaetion",
        template: "orderConfirmation.ejs",
        data: mailData,
      });
    }
    user.courses.push(course._id);
    await user.save();
    const notification = await notificationModel.create({
      userId: user._id,
      title: "New Order",
      message: `You have new order from ${course.name}`,
    });

    course.purchased = (course.purchased || 0) + 1;
    await course.save();

    newOrder(data, res, next);
  }
);
//get all orders - only admin
export const getAllOrders = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    getAllOrderList(res);
  }
);
