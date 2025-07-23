console.log(`[TOP OF CART ROUTES] cart.js loaded at ${new Date().toISOString()}`);
import express from "express";
import { body, param } from "express-validator";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeCart,
} from "../controllers/cartController.js";
import { getFixedCart } from "../controllers/fixedCartController.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import { debugMiddleware } from "../middleware/debugMiddleware.js";
import { fixedCartMiddleware } from "../middleware/fixedCartMiddleware.js";

const router = express.Router();

// Validation rules
const addToCartValidation = [
  body("alienId").isMongoId().withMessage("Invalid alien ID format"),
  body("quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),
];

const updateCartValidation = [
  param("alienId").isMongoId().withMessage("Invalid alien ID format"),
  body("quantity")
    .isInt({ min: 0, max: 10 })
    .withMessage("Quantity must be between 0 and 10"),
];

const removeFromCartValidation = [
  param("alienId").isMongoId().withMessage("Invalid alien ID format"),
];

const mergeCartValidation = [
  body("sessionId").notEmpty().withMessage("Session ID is required"),
];

// Routes

// Apply debug middleware to all cart routes
router.use(debugMiddleware);

// Apply fixed cart middleware to all cart routes
router.use(fixedCartMiddleware);

// GET /api/cart - Get user's cart
router.get("/", optionalAuth, (req, res, next) => {
  console.log('[ROUTE] GET /api/cart called');
  return getCart(req, res, next);
});

// GET /api/cart/fixed - Get the fixed cart directly from the database
router.get("/fixed", getFixedCart);

// POST /api/cart/add - Add item to cart
router.post("/add", optionalAuth, addToCartValidation, addToCart);

// PUT /api/cart/update/:alienId - Update cart item quantity
router.put(
  "/update/:alienId",
  optionalAuth,
  updateCartValidation,
  updateCartItem
);

// DELETE /api/cart/remove/:alienId - Remove item from cart
router.delete(
  "/remove/:alienId",
  optionalAuth,
  removeFromCartValidation,
  removeFromCart
);

// DELETE /api/cart/clear - Clear entire cart
router.delete("/clear", optionalAuth, clearCart);

// POST /api/cart/merge - Merge guest cart with user cart (requires auth)
router.post("/merge", requireAuth, mergeCartValidation, (req, res, next) => {
  console.log('[ROUTE] POST /api/cart/merge called');
  return mergeCart(req, res, next);
});

export default router;
