import { getOrderDetails, getUserRentals, getQTYOrderbyID } from "../controllers/order.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import express from "express";

const router = express.Router();

// Get order-detail by id
router.get("/order-detail/:id", verifyToken, getOrderDetails);

// Get all order
router.get("/rentals", verifyToken, getUserRentals);

// Get QTY order
router.get("/order-qty/:id", verifyToken, getQTYOrderbyID);

export default router;