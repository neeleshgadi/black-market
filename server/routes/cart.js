import express from "express";
import { body, param } from "express-validator";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Validation rules
const addToCartValidation = [
  body("alienId").isMongoId().withMessage("Invalid alien ID format"),
  body("quantity")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("Quantity must be between 1 and 10"),
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

// All routes require authentication
router.use(requireAuth);

// GET /api/cart - Get user's cart
router.get("/", getCart);

// POST /api/cart/add - Add item to cart
router.post("/add", addToCartValidation, addToCart);

// PUT /api/cart/update/:alienId - Update cart item quantity
router.put("/update/:alienId", updateCartValidation, updateCartItem);

// DELETE /api/cart/remove/:alienId - Remove item from cart
router.delete("/remove/:alienId", removeFromCartValidation, removeFromCart);

// DELETE /api/cart/clear - Clear entire cart
router.delete("/clear", clearCart);

export default router;
