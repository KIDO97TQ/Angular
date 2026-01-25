import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());


try {
    await pool.query("SELECT 1");
    console.log("✅ CONNECT OK");
} catch (e) {
    console.error("❌ CONNECT FAIL");
    console.error("CODE:", e.code);
    console.error("MESSAGE:", e.message);
    console.error("DETAIL:", e);
}


app.get("/api/users", async (req, res) => {
    const { rows } = await pool.query("SELECT * FROM clothings.users");
    res.json(rows);
});

app.post("/api/login", async (req, res) => {
    try {
        const { user, pass } = req.body;

        // 1️⃣ Validate input
        if (!user || !pass) {
            return res.status(400).json({
                message: "Missing username or password"
            });
        }

        // 2️⃣ Tìm user (KHÔNG query password)
        const result = await pool.query(
            "SELECT id, fullname, password FROM clothings.users WHERE fullname = $1",
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
                fullname: dbUser.fullname
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
                fullname: dbUser.fullname
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Server error"
        });
    }
});


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// serve angular build
app.use(express.static(
    path.join(__dirname, "../dist/angular01/browser")
));

app.get(/.*/, (req, res) => {
    res.sendFile(
        path.join(__dirname, "../dist/Angular01/index.html")
    );
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("🚀 Server running on port", PORT);
});


//const PORT = 3000;
//app.listen(PORT, () => {
//    console.log(`🚀 Server running on http://localhost:${PORT}`);
//});