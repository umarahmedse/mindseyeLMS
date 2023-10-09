import express from "express";
import {
  addQuestion,
  addAnswer,
  editCourse,
  getAllCourses,
  getCourseByUser,
  getSingleCourse,
  uploadCourse,
  addReview,
  addReply,
} from "../controllers/course.controller";
import { protect, restrictTo } from "../utils/auth";
const router = express.Router();
router.get("/getcourse/:id", getSingleCourse);
router.get("/getcourses", getAllCourses);
router.get("/getcoursecontent/:id", protect, getCourseByUser);
router.post("/createcourse", protect, restrictTo("admin"), uploadCourse);
router.post("/addreview/:id", protect, addReview);
router.post("/addanswer", protect, addAnswer);
router.post("/addquestion", protect, addQuestion);
router.post("/addreply", protect, restrictTo("admin"), addReply);
router.patch("/editcourse/:id", protect, restrictTo("admin"), editCourse);

export default router;
