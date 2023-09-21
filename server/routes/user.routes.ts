import express from "express";
import {
  activateUser,
  loginUser,
  logoutUser,
  registerUser,
  updateAccessToken,
} from "../controllers/user.controller";
import { protect } from "../utils/auth";

const router = express.Router();
router.post("/register", registerUser);
router.post("/activate", activateUser);
router.post("/login", loginUser);
router.get("/logout", protect, logoutUser);
router.get("/refreshtoken", updateAccessToken);
export default router;
//3:35:36
