import express from "express";
import { protect, restrictTo } from "../utils/auth";
import {
  getNotification,
  updateNotification,
} from "../controllers/notification.controller";
const router = express.Router();
router.get(
  "/getallnotificatons",
  protect,
  restrictTo("admin"),
  getNotification
);
router.post(
  "/updatenotification/:id",
  protect,
  restrictTo("admin"),
  updateNotification
);
export default router;
