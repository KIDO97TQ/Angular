import express from "express";
import { login, checkUsername, signup, checkCurrentPassword, updatePassword } from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// POST /api/auth/login
router.post("/login", login);

// CHECK username exists
router.get("/check-username/:username", checkUsername);

// SIGNUP
router.post("/signup", signup);

// check password
router.post("/check-password", verifyToken, checkCurrentPassword);

// update password
router.put("/update-password", verifyToken, updatePassword);
export default router;
