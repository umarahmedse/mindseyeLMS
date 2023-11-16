import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/AppError";
import layoutModel from "../models/layout.model";
import cloudinary from "cloudinary";

//create layout route

export const createLayout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { type } = req.body;
    const isTypeExist = await layoutModel.findOne({ type });
    if (isTypeExist) {
      return next(new AppError(`${type} already exists`, 401));
    }
    if (type === "Banner") {
      const { image, title, subtitle } = req.body;
      const myCloud = await cloudinary.v2.uploader.upload(image, {
        folder: "layout",
      });
      const banner = {
        image: {
          url: myCloud.secure_url,
          publicId: myCloud.public_id,
        },
        title,
        subtitle,
      };
      await layoutModel.create(banner);
    }
    if (type === "FAQ") {
      const { faq } = req.body;
      const faqItems = await Promise.all(
        faq.map((item: any) => {
          return {
            question: item.question,
            answer: item.answer,
          };
        })
      );
      await layoutModel.create({ type: "FAQ", faq: faqItems });
    }
    if (type === "Categories") {
      const { categories } = req.body;

      const categoriesItems = await Promise.all(
        categories.map((item: any) => {
          return {
            title: item.title,
          };
        })
      );
      await layoutModel.create({
        type: "Categories",
        categories: categoriesItems,
      });
    }
    res.status(201).json({
      success: true,
      message: "Layout Created Successfully",
    });
  }
);

//edit layout

export const editLayout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { type } = req.body;
    if (!type) {
      return next(new AppError("Invalid Data", 400));
    }
    if (type === "Banner") {
      const bannerData: any = await layoutModel.findOne({ type: "Banner" });
      const { image, title, subtitle } = req.body;
      if (bannerData) {
        await cloudinary.v2.uploader.destroy(bannerData?.image.public_id);
      }
      const myCloud = await cloudinary.v2.uploader.upload(image, {
        folder: "layout",
      });
      const banner = {
        image: {
          url: myCloud.secure_url,
          publicId: myCloud.public_id,
        },
        title,
        subtitle,
      };
      await layoutModel.findByIdAndUpdate(bannerData._id, { banner });
    }
    if (type === "FAQ") {
      const { faq } = req.body;
      const faqItem = await layoutModel.findOne({ type: "FAQ" });
      const faqItems = await Promise.all(
        faq.map((item: any) => {
          return {
            question: item.question,
            answer: item.answer,
          };
        })
      );
      await layoutModel.findByIdAndUpdate(faqItem?._id, {
        type: "FAQ",
        faq: faqItems,
      });
    }
    if (type === "Categories") {
      const { categories } = req.body;
      const categoriesData = await layoutModel.findOne({ type: "Categories" });

      const categoriesItems = await Promise.all(
        categories.map((item: any) => {
          return {
            title: item.title,
          };
        })
      );
      await layoutModel.findByIdAndUpdate(categoriesData?._id, {
        type: "Categories",
        categories: categoriesItems,
      });
    }
    res.status(201).json({
      success: true,
      message: "Layout Updated Successfully",
    });
  }
);

//get layout by type

export const getLayoutByType = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { type } = req.body;
    const layout = await layoutModel.findOne({ type });
    if (!layout) {
      return next(new AppError("No Such Requested Data", 404));
    }
    res.status(201).json({
      success: true,
      layout,
    });
  }
);
