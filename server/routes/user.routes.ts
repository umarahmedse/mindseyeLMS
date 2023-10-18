import express from "express";
import {
  activateUser,
  deleteUser,
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
  updateUserRole,
} from "../controllers/user.controller";
import { protect, restrictTo } from "../utils/auth";

const router = express.Router();
router.post("/register", registerUser);
router.post("/activate", activateUser);
router.post("/login", loginUser);
router.post("/socialauth", socialAuth);
router.post("/updateuserrole", protect, restrictTo("admin"), updateUserRole);
router.get("/logout", protect, logoutUser);
router.get("/me", protect, getUserInfo);
router.get("/getallusers", protect, restrictTo("admin"), getAllUser);
router.get("/refreshtoken", updateAccessToken);
router.patch("/update", protect, updateUserInfo);
router.patch("/updatepassword", protect, updatePassword);
router.patch("/updateavatar", protect, updateProfilePicture);
router.delete("/deleteuser/:id", protect, restrictTo("admin"), deleteUser);
export default router;
// 7:33
