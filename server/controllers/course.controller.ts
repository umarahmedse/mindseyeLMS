import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/AppError";
import cloudinary from "cloudinary";
import { createCourse, getAllCourseList } from "../services/course.service";
import courseModel from "../models/course-model";
import redis from "../utils/redis";
import {
  InterfaceAddAnswerData,
  InterfaceAddQuestionData,
  InterfaceAddReplyData,
  InterfaceAddReviewData,
} from "../utils/interfaces";
import mongoose from "mongoose";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/sendMail";
import notificationModel from "../models/notification-model";
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
//add question in course

export const addQuestion = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { question, courseId, contentId }: InterfaceAddQuestionData =
      req.body;
    const course = await courseModel.findById(courseId);
    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return next(new AppError("Invalid Content Id", 400));
    }
    const courseContent = course?.courseData.find((item: any) =>
      item._id.equals(contentId)
    );
    if (!courseContent) {
      return next(new AppError("No such content found", 404));
    }
    const newQuestion: any = {
      user: req.user,
      question,
      questionReplies: [],
    };
    courseContent.questions.push(newQuestion);
    const notification = await notificationModel.create({
      userId: req.user?._id,
      title: "New Question Received",
      message: `You have new question from ${courseContent.title}`,
    });
    await course?.save();
    res.status(201).json({
      success: true,
      course,
    });
  }
);
//add answer in course

export const addAnswer = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { answer, contentId, courseId, questionId }: InterfaceAddAnswerData =
      req.body;
    const course = await courseModel.findById(courseId);
    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return next(new AppError("Invalid Content Id", 400));
    }
    const courseContent = course?.courseData.find((item: any) =>
      item._id.equals(contentId)
    );
    if (!courseContent) {
      return next(new AppError("No such content found", 404));
    }
    const question = courseContent.questions?.find((item: any) =>
      item._id.equals(questionId)
    );
    if (!questionId) {
      return next(new AppError("No such question found", 404));
    }
    const newAnswer: any = {
      user: req.user,
      answer: answer,
    };
    question?.questionReplies.push(newAnswer);
    await course?.save();
    if (req.user?._id === question?.user._id) {
      const notification = await notificationModel.create({
        userId: req.user?._id,
        title: "New Question Reply Received",
        message: `You have new question reply from ${courseContent.title}`,
      });
    } else {
      const data: any = {
        name: question?.user.name,
        title: courseContent.title,
      };
      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/question-reply.ejs"),
        data
      );
      try {
        await sendMail({
          email: question?.user.email || "",
          subject: "New Answer Added to your Question",
          template: "question-reply.ejs",
          data,
        });
      } catch {
        return next(new AppError("email sending failed", 500));
      }
    }
    res.status(201).json({
      success: true,
      course,
    });
  }
);

//ADD REVIEW IN COURSE

export const addReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userCourseList = req.user?.courses;
    const courseId = req.params.id;
    const courseExist = userCourseList?.some(
      (course: any) => course._id.toString() === courseId.toString()
    );
    if (!courseExist) {
      return next(new AppError("Not eligible to review", 401));
    }
    const course = await courseModel.findById(courseId);
    if (!course) {
      return next(new AppError("No such Course", 404));
    }

    const { review, rating } = req.body as InterfaceAddReviewData;
    const reviewData: any = {
      user: req.user,
      comment: review,
      rating,
    };
    course?.reviews.push(reviewData);
    let avg = 0;
    course?.reviews.forEach((rev: any) => {
      avg += rev.rating;
    });
    if (course) {
      course.ratings = avg / course?.reviews.length;
    }
    await course?.save();
    const notification = {
      title: "New Review Received",
      message: `${req.user?.name} has given a review on ${course?.name}`,
    };
    //create notification
    res.status(201).json({
      success: true,
      course,
    });
  }
);
//ADD REPLY TO REVIEW

export const addReply = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { comment, courseId, reviewId } = req.body as InterfaceAddReplyData;
    const course = await courseModel.findById(courseId);
    if (!course) {
      return next(new AppError("course not found", 404));
    }
    const review = course.reviews.find(
      (rev: any) => rev._id.toString() === reviewId
    );
    if (!review) {
      return next(new AppError("review not found", 404));
    }
    const replyData: any = {
      user: req.user,
      comment,
    };
    if (!review.commentReplies) {
      review.commentReplies = [];
    }
    review.commentReplies?.push(replyData);
    await course.save();
    res.status(201).json({
      success: true,
      course,
    });
  }
);
// get all courses -- admin only
export const getAllCourse = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    getAllCourseList(res);
  }
);
