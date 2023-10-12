import { NextFunction, Response } from "express";
import catchAsync from "../utils/catchAsync";
import orderModel from "../models/order-model";
//create new order

export const newOrder = catchAsync(
  async (data: any, res: Response, next: NextFunction) => {
    const order = await orderModel.create(data);

    res.status(201).json({
      success: true,
      order,
    });
  }
);
