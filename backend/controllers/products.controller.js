import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

// ========== 1. LONGIN ==========
export const getProductByType = async (req, res) => {
    try {
        const { type } = req.params;

        if (!type) {
            return res.status(400).json({ message: "Thiếu type" });
        }

        const { rows } = await pool.query(
            `
      SELECT
  pro.productid   AS id,
  pro.productname AS productname,
  pro.priceperday AS productprice,
  pro.size        AS productsize,
  pro.stockquantity,
  pro.saveqty
FROM clothings.products pro
JOIN clothings.product_types type
  ON UPPER(pro.type_production) = UPPER(type.type_name)
WHERE type.type_slug = $1

      `,
            [type]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Không có sản phẩm nào" });
        }

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};


// ========== 2. CHECK USERNAME EXISTS ==========
export const checkUsername = async (req, res) => {
    try {
        const { username } = req.params;

        // Validate
        if (!username || username.length < 3) {
            return res.status(400).json({
                exists: false,
                message: "Tài khoản phải dài hơn 3 ký tự"
            });
        }

        // Query database
        const { rows } = await pool.query(
            "SELECT COUNT(*) as count FROM clothings.userskido WHERE username = $1",
            [username]
        );

        const exists = parseInt(rows[0].count) > 0;

        res.json({
            exists: exists,
            message: exists ? "Tài khoản đã tồn tại" : "Tên người dùng khả dụng"
        });

    } catch (err) {
        console.error("Check username error:", err);
        res.status(500).json({
            exists: false,
            message: "Server error"
        });
    }
};

// ========== 3. SIGNUP (Đăng ký user mới) ==========
export const signup = async (req, res) => {
    try {
        const { user, phone, pass } = req.body;
        // Validate input
        if (!user || !phone || !pass) {
            return res.status(400).json({
                message: "Tất cả các thông tin cần điền hết"
            });
        }

        if (user.length < 3) {
            return res.status(400).json({
                message: "Tài khoản phải dài hơn 3 ký tự"
            });
        }

        if (pass.length < 6) {
            return res.status(400).json({
                message: "Mật khẩu phải dài hơn 6 ký tự"
            });
        }

        // Check username or phone already exists
        const { rows: existingUsers } = await pool.query(
            "SELECT COUNT(*) as count FROM clothings.userskido WHERE username = $1 OR email = $2",
            [user, phone]
        );

        if (parseInt(existingUsers[0].count) > 0) {
            return res.status(409).json({
                message: "Tài khoản hoặc số điện thoại đã tồn tại"
            });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(pass, saltRounds);

        // Insert new user
        const { rows } = await pool.query(
            `INSERT INTO clothings.userskido (username, email, password) 
             VALUES ($1, $2, $3) 
             RETURNING id, username, email`,
            [user, phone, hashedPassword]
        );

        const newUser = rows[0];

        res.status(201).json({
            message: "User created successfully",
            user: {
                id: newUser.id,
                username: newUser.username,
                phone: newUser.email
            }
        });

    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({
            message: err + "Server error during signup"
        });
    }
};