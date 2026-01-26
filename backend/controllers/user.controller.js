import { pool } from "../db.js";

export const getUsers = async (req, res) => {
    try {
        const { rows } = await pool.query(
            "SELECT * FROM clothings.userskido"
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Cannot fetch users"
        });
    }
};
