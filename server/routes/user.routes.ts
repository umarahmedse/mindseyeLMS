import express from "express";
import {
  activateUser,
  getAllUser,
  getUserInfo,
  loginUser,
  logoutUser,
  registerUser,
  socialAuth,
  updateAccessToken,
  updatePassword,
  updateProfilePicture,
  updateUserInfo,
} from "../controllers/user.controller";
import { protect, restrictTo } from "../utils/auth";

const router = express.Router();
router.post("/register", registerUser);
router.post("/activate", activateUser);
router.post("/login", loginUser);
router.post("/socialauth", socialAuth);
router.get("/logout", protect, logoutUser);
router.get("/me", protect, getUserInfo);
router.get("/getallusers", protect, restrictTo("admin"), getAllUser);

router.get("/refreshtoken", updateAccessToken);
router.patch("/update", protect, updateUserInfo);
router.patch("/updatepassword", protect, updatePassword);
router.patch("/updateavatar", protect, updateProfilePicture);
export default router;
