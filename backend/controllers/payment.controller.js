// backend/controllers/payment.controller.js

// import payOS from '@payos/node';
import payOS from "../utils/payos.js";
import { pool } from "../db.js";
import crypto from "crypto";

// ================================
// TẠO PAYMENT
// ================================

function sortObjDataByKey(object) {
    return Object.keys(object)
        .sort()
        .reduce((obj, key) => {
            obj[key] = object[key];
            return obj;
        }, {});
}

function convertObjToQueryStr(object) {
    return Object.keys(object)
        .filter((key) => object[key] !== undefined)
        .map((key) => {
            let value = object[key];

            if (value && Array.isArray(value)) {
                value = JSON.stringify(value);
            }

            if ([null, undefined].includes(value)) {
                value = "";
            }

            return `${key}=${value}`;
        })
        .join("&");
}

export const createPaymentLink = async (req, res) => {
    const client = await pool.connect();

    try {
        const { items, totalAmount, depositAmount } = req.body;
        const userId = req.user.id;

        await client.query("BEGIN");

        const orderCode = Math.floor(Date.now() / 1000);

        const orderResult = await client.query(
            `INSERT INTO kido.orders 
       (user_id, order_code, total_amount, deposit_amount, payment_status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING id`,
            [userId, orderCode, totalAmount, depositAmount]
        );

        const orderId = orderResult.rows[0].id;

        for (const item of items) {
            const subtotal =
                item.price * item.quantity * item.rental_days;

            await client.query(
                `INSERT INTO kido.order_items
         (order_id, product_id, quantity, price, rental_days, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    orderId,
                    item.product_id,
                    item.quantity,
                    item.price,
                    item.rental_days,
                    subtotal
                ]
            );
        }

        await client.query("COMMIT");

        // ===== PAYOS PART =====

        const expiredAt = Math.floor(Date.now() / 1000) + 15 * 60;

        const paymentData = {
            orderCode: Number(orderCode),
            amount: Number(depositAmount),
            description: "Thanh toan",
            buyerName: "Khach hang",
            buyerEmail: "test@gmail.com",
            buyerPhone: "0900000000",
            items: [
                {
                    name: "Dat coc",
                    quantity: 1,
                    price: Number(depositAmount),
                    unit: "dong",
                    taxPercentage: 0
                }
            ],
            cancelUrl: "http://localhost:4200/payment-cancel",
            returnUrl: `http://localhost:4200/payment-success?orderCode=${orderCode}`,
            expiredAt
        };

        // ===== TẠO SIGNATURE =====

        const sortedData = sortObjDataByKey(paymentData);
        const dataQueryStr = convertObjToQueryStr(sortedData);

        const signature = crypto
            .createHmac("sha256", process.env.PAYOS_CHECKSUM_KEY)
            .update(dataQueryStr)
            .digest("hex");

        paymentData.signature = signature;

        console.log("📝 Creating payment:", paymentData);
        console.log("🔐 Raw string:", dataQueryStr);
        console.log("🔐 Signature:", signature);

        // ===== CALL PAYOS =====

        const paymentResponse = await payOS.request({
            method: "POST",
            url: "/payment-requests",
            data: paymentData
        });

        console.log("💳 PayOS response:", paymentResponse);

        res.json({
            success: true,
            checkoutUrl: paymentResponse.data.checkoutUrl,
            qrCode: paymentResponse.data.qrCode,
            orderCode
        });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("❌ Payment error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "PayOS error"
        });
    } finally {
        client.release();
    }
};


// ================================
// WEBHOOK
// ================================
export const payosWebhook = async (req, res) => {
    try {
        const data = req.body;

        console.log("📨 Webhook received:", data);

        // Verify webhook signature
        const isValid = payOS.verifyPaymentWebhookData(data);

        if (!isValid) {
            console.error("❌ Invalid webhook signature");
            return res.status(400).json({ message: "Invalid signature" });
        }

        if (data.code === "00") {
            const orderCode = data.data.orderCode;

            await pool.query(
                `UPDATE kido.orders
                 SET payment_status = 'paid',
                     updated_at = CURRENT_TIMESTAMP
                 WHERE order_code = $1`,
                [orderCode]
            );

            console.log("✅ Thanh toán thành công:", orderCode);
        }

        res.status(200).json({ message: "ok" });

    } catch (error) {
        console.error("❌ Webhook error:", error);
        res.status(500).json({ message: "Webhook error" });
    }
};

// ================================
// CHECK ORDER STATUS
// ================================
export const getOrderStatus = async (req, res) => {
    try {
        const { orderCode } = req.params;

        const result = await pool.query(
            `SELECT payment_status, total_amount, deposit_amount
             FROM kido.orders 
             WHERE order_code = $1`,
            [orderCode]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json({
            success: true,
            status: result.rows[0].payment_status,
            totalAmount: result.rows[0].total_amount,
            depositAmount: result.rows[0].deposit_amount
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};