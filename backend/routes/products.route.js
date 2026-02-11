import { getProductByType, searchProducts, getAllProducts, getAllProductsType } from "../controllers/products.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import express from "express";

const router = express.Router();

// get product all
router.get("/get-product-by-type/all", getAllProducts);
// get search product by type
router.get("/get-product-by-type/search", searchProducts);
// get product by type
router.get("/get-product-by-type/bytype", getProductByType);
// get all product type
router.get("/get-product-by-type/alltype", getAllProductsType);

export default router;