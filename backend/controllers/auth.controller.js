import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

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
                message: "Invalid username or password"
            });
        }

        const dbUser = result.rows[0];

        // 3️⃣ So sánh password
        const isMatch = await bcrypt.compare(pass, dbUser.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid username or password"
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
