import { getProductByType, searchProducts, getAllProducts } from "../controllers/products.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import express from "express";

const router = express.Router();

// get product all
router.get("/get-product-by-type/all", getAllProducts);
// get product by type
router.get("/get-product-by-type/search", searchProducts);
// get product by type
router.get("/get-product-by-type/:type", getProductByType);

export default router;