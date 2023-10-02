import express from "express";
import {
  activateUser,
  getUserInfo,
  loginUser,
  logoutUser,
  registerUser,
  socialAuth,
  updateAccessToken,
  updatePassword,
  updateUserInfo,
} from "../controllers/user.controller";
import { protect } from "../utils/auth";

const router = express.Router();
router.post("/register", registerUser);
router.post("/activate", activateUser);
router.post("/login", loginUser);
router.post("/socialauth", socialAuth);
router.get("/logout", protect, logoutUser);
router.get("/me", protect, getUserInfo);
router.get("/refreshtoken", updateAccessToken);
router.patch("/update", protect, updateUserInfo);
router.patch("/updatepassword", protect, updatePassword);
export default router;
