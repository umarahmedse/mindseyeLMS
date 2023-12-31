import { Response } from "express";
import courseModel from "../models/course-model";
import catchAsync from "../utils/catchAsync";

//create course

export const createCourse = catchAsync(async (data: any, res: Response) => {
  const course = await courseModel.create(data);
  res.status(201).json({
    success: true,
    course,
  });
});

export const getAllCourseList = async (res: Response) => {
  const courses = await courseModel.find().sort({ createdAt: -1 });
  res.status(201).json({
    success: true,
    courses,
  });
};
