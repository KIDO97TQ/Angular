import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

// ========= 1. GET USER RENTALS () =========
export const getUserRentals = async (req, res) => {
    const client = await pool.connect();

    try {
        const userId = req.user.id;
        await client.query("BEGIN");

        await client.query(`
            UPDATE kido.orders
            SET payment_status = 'expired',
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $1
            AND payment_status = 'pending'
            AND created_at < NOW() - INTERVAL '15 minutes'
        `, [userId]);

        const result = await client.query(`
            SELECT 
                o.id,
                o.order_code,
                o.total_amount,
                o.deposit_amount,
                o.payment_status AS status,
                o.created_at as startDate,
                o.checkout_url
            FROM kido.orders o
            WHERE o.user_id = $1
            ORDER BY o.created_at DESC
        `, [userId]);

        await client.query("COMMIT");
        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        await client.query("ROLLBACK");
        res.status(500).json({ message: "Server error" });
    } finally {
        client.release();
    }
};


// ========== 2. Get Order by ID ==========
export const getOrderDetails = async (req, res) => {
    try {
        const { id: Id } = req.params;
        // const userId = req.user.id;

        const result = await pool.query(
            `SELECT 
                ci.order_id,
                ci.product_id as productid,
                ci.quantity,
                ci.price,
                ci.rental_days,
                ci.subtotal,
                ci.created_at,
                pro.productname AS productname
             FROM kido.order_items ci, clothings.products pro
             WHERE pro.productid = ci.product_id and ci.order_id = $1`,
            [Id]
        );

        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Không thể lấy order"
        });
    }
};

// ========== 3. Get qty by ID ==========
export const getQTYOrderbyID = async (req, res) => {
    try {
        const { id: Id } = req.params;

        const result = await pool.query(
            `SELECT ci.*
             FROM kido.orders ci
             WHERE ci.payment_status ='paid' and ci.user_id = $1`,
            [Id]
        );

        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Không thể lấy order"
        });
    }
};
