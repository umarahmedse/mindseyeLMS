import express from "express";
import { protect, restrictTo } from "../utils/auth";
import {
  getCoursesAnalytics,
  getOrderAnalytics,
  getUserAnalytics,
} from "../controllers/analytics.controller";
const router = express.Router();
router.get(
  "/getusersanalytics",
  protect,
  restrictTo("admin"),
  getUserAnalytics
);
router.get(
  "/getcoursesanalytics",
  protect,
  restrictTo("admin"),
  getCoursesAnalytics
);
router.get(
  "/getordersanalytics",
  protect,
  restrictTo("admin"),
  getOrderAnalytics
);

export default router;
