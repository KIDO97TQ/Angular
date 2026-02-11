import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

// ========== 1. getProductByType ==========
export const getProductByType = async (req, res) => {
    try {
        const { type } = req.query;
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
  WHERE pro.type_production  = $1

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

// ========== 2. searchProducts ==========
export const searchProducts = async (req, res) => {
    try {
        const { keyword } = req.query;

        if (!keyword) {
            return res.status(400).json({ message: "Thiếu keyword" });
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
            WHERE pro.productname ILIKE $1
            `,
            [`%${keyword}%`]
        );

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// ========== 3. getAllProducts ==========
export const getAllProducts = async (req, res) => {
    try {
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
            `
        );

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// ========== 4. getAllProductsType ==========
export const getAllProductsType = async (req, res) => {
    try {
        const { rows } = await pool.query(
            `select DISTINCT type_production  from clothings.products ORDER BY type_production ASC `
        );

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
