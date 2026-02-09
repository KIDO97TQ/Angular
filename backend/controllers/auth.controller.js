import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

// ========== 1. LONGIN ==========
export const login = async (req, res) => {
    try {
        const { user, pass } = req.body;

        // 1️⃣ Validate input
        if (!user || !pass) {
            return res.status(400).json({
                message: "Thiếu tài khoản hoặc mật khẩu"
            });
        }

        // 2️⃣ Tìm user
        const result = await pool.query(
            "SELECT id, username, password FROM clothings.userskido WHERE username = $1 OR email = $1",
            [user]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Tài khoản không tồn tại"
            });
        }

        const dbUser = result.rows[0];

        // 3️⃣ So sánh password
        const isMatch = await bcrypt.compare(pass, dbUser.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Sai mật khẩu"
            });
        }

        // 4️⃣ Tạo JWT
        const token = jwt.sign(
            {
                id: dbUser.id,
                username: dbUser.username
            },
            process.env.JWT_SECRET,
            { expiresIn: "1m" }
        );

        // 5️⃣ Trả kết quả
        res.json({
            message: "Login success",
            token,
            user: {
                id: dbUser.id,
                username: dbUser.username
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Server error"
        });
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