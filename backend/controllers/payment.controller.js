// backend/controllers/payment.controller.js

// import payOS from '@payos/node';
import payOS from "../utils/payos.js";
import { pool } from "../db.js";
import crypto from "crypto";

// ================================
// TẠO PAYMENT
// ================================

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

        const expiredAt = Math.floor(Date.now() / 1000) + 15 * 60;

        const paymentData = {
            orderCode: Number(orderCode),
            amount: Number(depositAmount),
            description: "Coc don hang",
            items: items.map(i => ({
                name: i.productname,
                quantity: i.quantity,
                price: i.price
            })),
            cancelUrl: `${process.env.FRONTEND_URL}/payment-cancel`,
            returnUrl: `${process.env.FRONTEND_URL}/payment-success?orderCode=${orderCode}`,
            expiredAt
        };

        const paymentResponse = await payOS.paymentRequests.create(paymentData);
        // console.log("💳 PayOS response:", paymentResponse);

        res.json({
            success: true,
            checkoutUrl: paymentResponse.checkoutUrl,
            qrCode: paymentResponse.qrCode,
            orderCode
        });

        await client.query("COMMIT");
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
        const webhookData = await payOS.webhooks.verify(req.body);

        console.log("📩 Webhook:", webhookData);

        // Nếu không phải thanh toán thành công → bỏ qua
        if (webhookData?.code !== "00") {
            return res.status(200).send("OK");
        }

        if (!webhookData?.orderCode) {
            console.log("⚠️ Không có orderCode");
            return res.status(200).send("OK");
        }

        const orderCode = webhookData.orderCode;

        await pool.query(
            `UPDATE kido.orders
             SET payment_status = 'paid',
                 updated_at = CURRENT_TIMESTAMP
             WHERE order_code = $1 AND payment_status != 'paid'`,
            [orderCode]
        );

        console.log("✅ Updated order:", orderCode);

        return res.status(200).send("OK");

    } catch (error) {
        console.error("❌ Webhook error:", error.message);
        return res.status(200).send("OK");
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