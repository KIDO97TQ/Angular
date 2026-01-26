import express from "express";
import { getUsers } from "../controllers/user.controller";

const router = express.Router();

//Get /api/users
router.get("/", getUsers);

export default router;