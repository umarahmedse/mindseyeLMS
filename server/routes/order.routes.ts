import express from "express";
import { protect, restrictTo } from "../utils/auth";
import { createOrder, getAllOrders } from "../controllers/order.controller";
const router = express.Router();
router.post("/createorder", protect, createOrder);
router.get("/getallorders", protect, restrictTo("admin"), getAllOrders);
export default router;
// 7:23
