import 'dotenv/config';
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import productRoutes from "./routes/products.route.js";
import cartsRoutes from "./routes/carts.route.js";
import paymentRoutes from "./routes/payment.route.js";
import orderRoutes from "./routes/order.route.js";


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/carts", cartsRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/order", orderRoutes);


try {
    await pool.query("SELECT 1");
    console.log("✅ CONNECT OK");
} catch (e) {
    console.error("❌ CONNECT FAIL");
    console.error("CODE:", e.code);
    console.error("MESSAGE:", e.message);
    console.error("DETAIL:", e);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const angularPath = path.join(__dirname, "../dist/AmyStudio/browser");
app.use(express.static(angularPath));
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(angularPath, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("🚀 Server running on port", PORT);
});
