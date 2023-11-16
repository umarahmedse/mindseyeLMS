import express from "express";

import { protect, restrictTo } from "../utils/auth";
import {
  createLayout,
  editLayout,
  getLayoutByType,
} from "../controllers/layout.controller";
const router = express.Router();
router.post("/createlayout", protect, restrictTo("admin"), createLayout);
router.patch("/editlayout", protect, restrictTo("admin"), editLayout);
router.get("/getlayout", getLayoutByType);

export default router;
