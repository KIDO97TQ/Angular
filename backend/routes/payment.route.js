import { getOrderStatus, createPaymentLink, payosWebhook, getPaymentHistory } from "../controllers/payment.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import express from "express";

const router = express.Router();
// Checkout
router.post("/create-payment", verifyToken, createPaymentLink);

//db bên payos trả lời check xem user chuyển tiền chưa
router.post("/webhook", payosWebhook);

//check xem user chuyển tiền chưa
router.post("/order-status", verifyToken, getOrderStatus);
//router.post("/order-status", getOrderStatus);

router.get("/order-history", verifyToken, getPaymentHistory);
export default router;