import { getOrderStatus, createPaymentLink, payosWebhook } from "../controllers/payment.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import express from "express";

const router = express.Router();

// Checkout
router.post("/create-payment", verifyToken, createPaymentLink);

//db bên payos trả lời check xem user chuyển tiền chưa
router.post("/webhook", payosWebhook);

//check xem user chuyển tiền chưa
router.get("/order-status", verifyToken, getOrderStatus);

export default router;