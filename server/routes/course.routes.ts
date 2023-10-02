import express from "express";
import { editCourse, uploadCourse } from "../controllers/course.controller";
import { protect, restrictTo } from "../utils/auth";
const router = express.Router();

router.post("/createcourse", protect, restrictTo("admin"), uploadCourse);
router.patch("/editcourse", protect, restrictTo("admin"), editCourse);

export default router;
