import express from "express";
import { protect, restrictTo } from "../utils/auth";
import { createOrder } from "../controllers/order.controller";
const router = express.Router();
router.post("/createorder", protect, createOrder);

export default router;
