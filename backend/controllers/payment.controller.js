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

        const orderCode = Date.now();

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
            description: `ma don: ${orderCode}`,
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

        await client.query(
            `UPDATE kido.orders 
             SET checkout_url = $1 
             WHERE id = $2`,
            [paymentResponse.checkoutUrl, orderId]
        );

        await client.query("COMMIT");

        res.json({
            success: true,
            checkoutUrl: paymentResponse.checkoutUrl,
            qrCode: paymentResponse.qrCode,
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
    const client = await pool.connect();

    try {
        const webhookData = await payOS.webhooks.verify(req.body);

        if (!webhookData?.orderCode) {
            return res.status(200).send("OK");
        }

        await client.query("BEGIN");

        const orderRes = await client.query(
            `SELECT id, deposit_amount, payment_status, user_id
             FROM kido.orders
             WHERE order_code = $1
             FOR UPDATE`,
            [webhookData.orderCode]
        );

        if (orderRes.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(200).send("OK");
        }

        const order = orderRes.rows[0];
        // 🔁 Idempotent
        if (order.payment_status === "paid") {
            await client.query("ROLLBACK");
            return res.status(200).send("OK");
        }
        // ❌ Fail
        if (webhookData.code !== "00") {
            await client.query(
                `UPDATE kido.orders
                 SET payment_status = 'failed'
                 WHERE id = $1`,
                [order.id]
            );

            await client.query("COMMIT");
            return res.status(200).send("OK");
        }

        // ✅ Update order
        await client.query(
            `UPDATE kido.orders
             SET payment_status = 'paid',
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [order.id]
        );

        // 💾 Save payment log
        await client.query(
            `INSERT INTO kido.payments
             (order_id, transaction_id, amount, status, raw_data)
             VALUES ($1,$2,$3,'success',$4)`,
            [
                order.id,
                webhookData.transactionId,
                webhookData.amount,
                JSON.stringify(webhookData)
            ]
        );

        // 🛒 Clear selected items
        const updateResult = await client.query(
            `UPDATE kido.cart_items c
             SET quantity = c.quantity - oi.quantity
             FROM kido.order_items oi,
             kido.carts ca
             WHERE oi.order_id = $1
             AND oi.product_id = c.product_id
             AND ca.id = c.cart_id
             AND ca.user_id = $2`,
            [order.id, order.user_id]
        );

        console.log("Updated rows:", updateResult.rowCount);

        // 2️⃣ Xóa những dòng bị về 0
        await client.query(
            ` DELETE FROM kido.cart_items
              WHERE cart_id in (select id from kido.carts where user_id = $1 )
              AND quantity <= 0`,
            [order.user_id]
        );

        await client.query("COMMIT");

        return res.status(200).send("OK");

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Webhook error:", error);
        return res.status(200).send("OK");
    } finally {
        client.release();
    }
};

// ================================
// CHECK ORDER STATUS
// ================================
export const getOrderStatus = async (req, res) => {
    try {
        const { orderCode } = req.body;
        const userId = req.user.id;

        if (!orderCode) {
            return res.status(400).json({ message: "Missing orderCode" });
        }

        // 1️⃣ Expire trước
        await pool.query(`
            UPDATE kido.orders
            SET payment_status = 'expired',
                updated_at = CURRENT_TIMESTAMP
            WHERE order_code = $1 AND user_id = $2
            AND payment_status = 'pending'
            AND created_at < NOW() - INTERVAL '15 minutes'`,
            [orderCode, userId]
        );

        // 2️⃣ Lấy trạng thái mới nhất
        const result = await pool.query(
            `SELECT payment_status, total_amount, deposit_amount, user_id
             FROM kido.orders
             WHERE order_code = $1 AND user_id = $2`,
            [orderCode, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Order not found" });
        }

        return res.json({
            success: true,
            status: result.rows[0].payment_status,
            totalAmount: result.rows[0].total_amount,
            depositAmount: result.rows[0].deposit_amount,
            user_id: result.rows[0].user_id
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};


// ================================
// HISTORY PAYMENTS
// ================================
export const getPaymentHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT o.order_code, o.total_amount, o.deposit_amount,
                    o.payment_status, o.created_at
             FROM kido.orders o
             WHERE o.user_id = $1
             ORDER BY o.created_at DESC`,
            [userId]
        );

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};