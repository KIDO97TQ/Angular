import express from "express";
import { getUsers } from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

//Get /api/users
//router.get("/", verifyToken, getUsers);
router.get("/", getUsers);

export default router;