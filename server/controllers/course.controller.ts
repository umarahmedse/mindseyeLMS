import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/AppError";
import cloudinary from "cloudinary";
import { createCourse } from "../services/course.service";
import courseModel from "../models/course-model";
import redis from "../utils/redis";
//CREATE COURSE
export const uploadCourse = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;
    const thumbnail = data.thumbnail;
    if (thumbnail) {
      const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
        folder: "courses",
      });
      data.thumbnail = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }
    createCourse(data, res, next);
  }
);
//EDIT COURSE
export const editCourse = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;

    const thumbnail = data.thumbnail;
    if (thumbnail) {
      await cloudinary.v2.uploader.destroy(thumbnail.public_id);
      const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
        folder: "courses",
      });
      data.thumbnail = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }
    const courseId = req.params.id;
    const course = await courseModel.findByIdAndUpdate(
      courseId,
      { $set: data },
      { new: true }
    );
    res.status(201).json({
      success: true,
      course,
    });
  }
);
//GET SINGLE COURSE (UNPURCHASED)

export const getSingleCourse = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const courseId = req.params.id;
    if (!courseId) {
      return next(new AppError("course id is required", 400));
    }
    const isCacheExisits = await redis.get(courseId);
    if (isCacheExisits) {
      const course = JSON.parse(isCacheExisits);
      res.status(201).json({
        success: true,
        course,
      });
    } else {
      const course = await courseModel
        .findById(courseId)
        .select(
          "-courseData.videoUrl -courseData.suggeston -courseData.questions -courseData.links"
        );

      if (!course) {
        return next(new AppError("course not found", 400));
      }
      await redis.set(courseId, JSON.stringify(course));
      res.status(201).json({
        success: true,
        course,
      });
    }
  }
);
//GET ALL COURSES (UNPURCHASED)

export const getAllCourses = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const isCacheExisits = await redis.get("allCourses");
    if (isCacheExisits) {
      const course = JSON.parse(isCacheExisits);
      res.status(201).json({
        success: true,
        course,
      });
    } else {
      const course = await courseModel
        .find()
        .select(
          "-courseData.videoUrl -courseData.suggeston -courseData.questions -courseData.links"
        );
      await redis.set("allCourses", JSON.stringify(course));

      res.status(201).json({
        success: true,
        course,
      });
    }
  }
);

//GET COURSE WITH CONTENT
export const getCourseByUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userCourseList = req.user?.courses;
    const courseId = req.params.id;
    const courseExistsInUser = userCourseList?.find(
      (course: any) => course._id.toString() === courseId.toString()
    );
    if (!courseExistsInUser) {
      return next(
        new AppError("You are not eligible, please purchase to access", 401)
      );
    }
    const course = await courseModel.findById(courseId);
    const content = course?.courseData;
    res.status(201).json({
      success: true,
      content,
    });
  }
);
//5:26:21
