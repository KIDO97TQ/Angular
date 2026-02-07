import { getProductByType } from "../controllers/products.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import express from "express";

const router = express.Router();

// get product by type
router.get("/get-product-by-type/:type", getProductByType);

export default router;