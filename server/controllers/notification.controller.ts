import notificationModel from "../models/notification-model";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/AppError";
import { Request, Response, NextFunction } from "express";
import cron from "node-cron";
//Only For Administrator
export const getNotification = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const notifications = await notificationModel
      .find()
      .sort({ createdAt: -1 });
    res.status(201).json({
      success: true,
      notifications,
    });
  }
);
//update notification stats
export const updateNotification = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const notification = await notificationModel.findById(req.params.id);
    if (!notification) {
      return next(new AppError("No Such Notification", 404));
    } else {
      notification?.status
        ? (notification.status = "read")
        : notification.status;
    }
    await notification.save();
    const notifications = await notificationModel
      .find()
      .sort({ createdAt: -1 });
    res.status(201).json({
      success: true,
      notifications,
    });
  }
);
//delete notification ---- only admin
cron.schedule("0 0 0 * * *", async () => {
  const dateLimit = new Date(Date.now() - 30 * 24 * 60 * 60 * 100);
  await notificationModel.deleteMany({
    status: "read",
    createdAt: { $lt: dateLimit },
  });
  console.log("Admin Notifications Managed Successfully");
});
