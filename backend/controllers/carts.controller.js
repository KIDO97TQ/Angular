import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

// ========== 1. addCartByUsserID ==========
export const addToCart = async (req, res) => {
    const client = await pool.connect();

    try {
        const { id: userId } = req.params;
        const { productId, price, rentalDays = 1 } = req.body;

        await client.query("BEGIN");

        // 1️⃣ Tìm cart active
        const cartResult = await client.query(
            `SELECT id FROM kido.carts
       WHERE user_id = $1 AND status = 'active'
       LIMIT 1`,
            [userId]
        );

        let cartId;

        // 2️⃣ Nếu chưa có cart → tạo mới
        if (cartResult.rows.length === 0) {
            const newCart = await client.query(
                `INSERT INTO kido.carts (user_id)
         VALUES ($1)
         RETURNING id`,
                [userId]
            );

            cartId = newCart.rows[0].id;
        } else {
            cartId = cartResult.rows[0].id;
        }

        // 3️⃣ Thêm / cập nhật cart_items (UPSERT)
        await client.query(
            `INSERT INTO kido.cart_items (cart_id, product_id, quantity, price, rental_days)
       VALUES ($1, $2, 1, $3, $4)
       ON CONFLICT (cart_id, product_id)
       DO UPDATE SET
         quantity = cart_items.quantity + 1`,
            [cartId, productId, price, rentalDays]
        );

        await client.query("COMMIT");

        res.status(200).json({
            success: true,
            message: "Đã thêm sản phẩm vào giỏ hàng"
        });

    } catch (err) {
        await client.query("ROLLBACK");
        console.error(err);

        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    } finally {
        client.release();
    }
};

// 2 get qty carts 

export const getCartCount = async (req, res) => {
    try {
        const { id: userId } = req.params;

        const result = await pool.query(
            `
      SELECT COALESCE(SUM(ci.quantity), 0) AS count
      FROM kido.carts c
      LEFT JOIN kido.cart_items ci ON ci.cart_id = c.id
      WHERE c.user_id = $1 AND c.status = 'active'
      `,
            [userId]
        );

        res.json({
            count: Number(result.rows[0].count)
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ count: 0 });
    }
};

// ========== 3. Get Cart Items by User ID ==========
export const getCartByUserId = async (req, res) => {
    try {
        const { id: userId } = req.params;
        // const userId = req.user.id;

        const result = await pool.query(
            `SELECT 
                ci.id,
                ci.product_id as productid,
                ci.quantity,
                ci.price as productprice,
                ci.rental_days,
                p.productname,
                p.size as productsize,
                c.user_id as userid
             FROM kido.carts c
             INNER JOIN kido.cart_items ci ON ci.cart_id = c.id
             INNER JOIN clothings.products p ON p.productid = ci.product_id
             WHERE c.user_id = $1 AND c.status = 'active'
             ORDER BY ci.created_at DESC`,
            [userId]
        );

        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Không thể lấy giỏ hàng"
        });
    }
};

// ========== 4. Update Cart Item Quantity ==========
export const updateCartItemQuantity = async (req, res) => {
    try {
        const { id: cartItemId } = req.params;
        const { quantity } = req.body;

        // Kiểm tra quantity hợp lệ
        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Số lượng không hợp lệ"
            });
        }

        const result = await pool.query(
            `UPDATE kido.cart_items
             SET quantity = $1
             WHERE id = $2
             RETURNING *`,
            [quantity, cartItemId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sản phẩm trong giỏ hàng"
            });
        }

        res.json({
            success: true,
            message: "Đã cập nhật số lượng",
            data: result.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
};

// ========== 5. Remove Cart Item ==========
export const removeCartItem = async (req, res) => {
    try {
        const { id: cartItemId } = req.params;

        const result = await pool.query(
            `DELETE FROM kido.cart_items
             WHERE id = $1
             RETURNING *`,
            [cartItemId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sản phẩm trong giỏ hàng"
            });
        }

        res.json({
            success: true,
            message: "Đã xóa sản phẩm khỏi giỏ hàng"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
};

// ========== 6. Clear Cart (Remove all items) ==========
export const clearCart = async (req, res) => {
    const client = await pool.connect();

    try {
        const { id: userId } = req.params;

        await client.query("BEGIN");

        // Tìm cart active
        const cartResult = await client.query(
            `SELECT id FROM kido.carts
             WHERE user_id = $1 AND status = 'active'
             LIMIT 1`,
            [userId]
        );

        if (cartResult.rows.length === 0) {
            await client.query("COMMIT");
            return res.json({
                success: true,
                message: "Giỏ hàng đã trống"
            });
        }

        const cartId = cartResult.rows[0].id;

        // Xóa tất cả items trong cart
        await client.query(
            `DELETE FROM kido.cart_items
             WHERE cart_id = $1`,
            [cartId]
        );

        await client.query("COMMIT");

        res.json({
            success: true,
            message: "Đã xóa toàn bộ giỏ hàng"
        });

    } catch (err) {
        await client.query("ROLLBACK");
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    } finally {
        client.release();
    }
};

// ========== 7. Get Cart Summary (Total, Deposit, etc.) ==========
export const getCartSummary = async (req, res) => {
    try {
        const { id: userId } = req.params;

        const result = await pool.query(
            `SELECT 
                COUNT(DISTINCT ci.product_id) as total_products,
                COALESCE(SUM(ci.quantity), 0) as total_items,
                COALESCE(SUM(ci.price * ci.quantity * ci.rental_days), 0) as total_rent_price,
                COUNT(DISTINCT ci.product_id) * 100000 as deposit_amount
             FROM kido.carts c
             LEFT JOIN kido.cart_items ci ON ci.cart_id = c.id
             WHERE c.user_id = $1 AND c.status = 'active'`,
            [userId]
        );

        res.json({
            success: true,
            data: {
                totalProducts: Number(result.rows[0].total_products),
                totalItems: Number(result.rows[0].total_items),
                totalRentPrice: Number(result.rows[0].total_rent_price),
                depositAmount: Number(result.rows[0].deposit_amount)
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Không thể lấy thông tin giỏ hàng"
        });
    }
};

// ========== 8. Checkout (Mark cart as completed) ==========
export const checkoutCart = async (req, res) => {
    const client = await pool.connect();

    try {
        const { id: userId } = req.params;

        await client.query("BEGIN");

        // Tìm cart active
        const cartResult = await client.query(
            `SELECT id FROM kido.carts
             WHERE user_id = $1 AND status = 'active'
             LIMIT 1`,
            [userId]
        );

        if (cartResult.rows.length === 0) {
            await client.query("COMMIT");
            return res.status(400).json({
                success: false,
                message: "Giỏ hàng trống"
            });
        }

        const cartId = cartResult.rows[0].id;

        // Kiểm tra có items không
        const itemsCheck = await client.query(
            `SELECT COUNT(*) as count FROM kido.cart_items
             WHERE cart_id = $1`,
            [cartId]
        );

        if (Number(itemsCheck.rows[0].count) === 0) {
            await client.query("COMMIT");
            return res.status(400).json({
                success: false,
                message: "Giỏ hàng trống"
            });
        }

        // Cập nhật status cart thành 'completed'
        await client.query(
            `UPDATE kido.carts
             SET status = 'completed'
             WHERE id = $1`,
            [cartId]
        );

        // TODO: Tạo order từ cart items
        // Bạn có thể thêm logic tạo order ở đây

        await client.query("COMMIT");

        res.json({
            success: true,
            message: "Đặt hàng thành công"
        });

    } catch (err) {
        await client.query("ROLLBACK");
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    } finally {
        client.release();
    }
};
