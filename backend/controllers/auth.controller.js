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
                message: "Missing username or password"
            });
        }

        // 2️⃣ Tìm user
        const result = await pool.query(
            "SELECT id, username, password FROM clothings.userskido WHERE username = $1",
            [user]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid username"
            });
        }

        const dbUser = result.rows[0];

        // 3️⃣ So sánh password
        const isMatch = await bcrypt.compare(pass, dbUser.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid password"
            });
        }

        // 4️⃣ Tạo JWT
        const token = jwt.sign(
            {
                id: dbUser.id,
                username: dbUser.username
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
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
                message: "Username must be at least 3 characters"
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
            message: exists ? "Username already taken" : "Username available"
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
        const { user, email, pass } = req.body;

        console.log(req.body);
        // Validate input
        if (!user || !email || !pass) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (user.length < 3) {
            return res.status(400).json({
                message: "Username must be at least 3 characters"
            });
        }

        if (pass.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        // Check username or email already exists
        const { rows: existingUsers } = await pool.query(
            "SELECT COUNT(*) as count FROM clothings.userskido WHERE username = $1 OR email = $2",
            [user, email]
        );

        if (parseInt(existingUsers[0].count) > 0) {
            return res.status(409).json({
                message: "Username or email already exists"
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
            [user, email, hashedPassword]
        );

        const newUser = rows[0];

        res.status(201).json({
            message: "User created successfully",
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            }
        });

    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({
            message: err + "Server error during signup"
        });
    }
};