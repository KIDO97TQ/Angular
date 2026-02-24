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
            "SELECT id, username, password, email as userphone, createdate FROM kido.userskido WHERE username = $1 OR email = $1",
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
                username: dbUser.username,
                userphone: dbUser.userphone,
                createdate: dbUser.createdate
            },
            process.env.JWT_SECRET
        );

        // 5️⃣ Trả kết quả
        res.json({
            message: "Login success",
            token,
            user: {
                id: dbUser.id,
                username: dbUser.username,
                userphone: dbUser.userphone,
                createdate: dbUser.createdate
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
            "SELECT COUNT(*) as count FROM kido.userskido WHERE username = $1",
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
            "SELECT COUNT(*) as count FROM kido.userskido WHERE username = $1 OR email = $2",
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
            `INSERT INTO kido.userskido (username, email, password) 
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

// ========== 4. CHECK CURRENT PASSWORD ==========
export const checkCurrentPassword = async (req, res) => {
    try {
        const userId = req.user.id; // lấy từ verifyToken
        const { currentPassword } = req.body;

        if (!currentPassword) {
            return res.status(400).json({
                message: "Vui lòng nhập mật khẩu hiện tại"
            });
        }

        // Lấy password từ DB
        const { rows } = await pool.query(
            "SELECT password FROM kido.userskido WHERE id = $1",
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Không tìm thấy user"
            });
        }

        const isMatch = await bcrypt.compare(
            currentPassword,
            rows[0].password
        );

        if (!isMatch) {
            return res.status(401).json({
                valid: false,
                message: "Mật khẩu hiện tại không đúng"
            });
        }

        res.json({
            valid: true,
            message: "Mật khẩu chính xác"
        });

    } catch (err) {
        console.error("Check password error:", err);
        res.status(500).json({
            message: "Server error"
        });
    }
};

// ========== 5. UPDATE PASSWORD ==========
export const updatePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                message: "Mật khẩu mới phải ít nhất 6 ký tự"
            });
        }

        // Hash password mới
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update DB
        await pool.query(
            "UPDATE kido.userskido SET password = $1 WHERE id = $2",
            [hashedPassword, userId]
        );

        res.json({
            message: "Cập nhật mật khẩu thành công"
        });

    } catch (err) {
        console.error("Update password error:", err);
        res.status(500).json({
            message: "Server error"
        });
    }
};