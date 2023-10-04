import express from "express";
import {
  editCourse,
  getAllCourses,
  getCourseByUser,
  getSingleCourse,
  uploadCourse,
} from "../controllers/course.controller";
import { protect, restrictTo } from "../utils/auth";
const router = express.Router();
router.get("/getcourse/:id", getSingleCourse);
router.get("/getcourses", getAllCourses);
router.get("/getcoursecontent/:id", protect, getCourseByUser);
router.post("/createcourse", protect, restrictTo("admin"), uploadCourse);
router.patch("/editcourse", protect, restrictTo("admin"), editCourse);

export default router;
