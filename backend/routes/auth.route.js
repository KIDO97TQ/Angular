import express from "express";
import { login } from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// POST /api/auth/login
router.post("/login", verifyToken, login);

export default router;
