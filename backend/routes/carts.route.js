import {
    addToCart, getCartCount, getCartByUserId, getCartSummary,
    updateCartItemQuantity, removeCartItem, clearCart, checkoutCart
} from "../controllers/carts.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import express from "express";

const router = express.Router();
// add carts
router.post("/addcarts/:id", verifyToken, addToCart);

// get qty carts
router.get("/count/:id", getCartCount);

// Get all cart items
router.get("/users/:id", getCartByUserId);

// Get cart summary (total, deposit, etc.)
router.get("/users/:id/cart/summary", getCartSummary);

// Update cart item quantity
router.put("/cart-items/:id", verifyToken, updateCartItemQuantity);

// Remove cart item
router.delete("/cart-items/:id", verifyToken, removeCartItem);

// Clear entire cart
router.delete("/users/:id/cart", verifyToken, clearCart);

// Checkout
router.post("/users/:id/cart/checkout", verifyToken, checkoutCart);

export default router;