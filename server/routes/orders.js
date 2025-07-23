import express from "express";
import { body, param } from "express-validator";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getOrderTracking,
} from "../controllers/orderController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Validation rules
const createOrderValidation = [
  body("shippingAddress.street")
    .trim()
    .notEmpty()
    .withMessage("Street address is required")
    .isLength({ max: 100 })
    .withMessage("Street address cannot exceed 100 characters"),
  body("shippingAddress.city")
    .trim()
    .notEmpty()
    .withMessage("City is required")
    .isLength({ max: 50 })
    .withMessage("City cannot exceed 50 characters"),
  body("shippingAddress.state")
    .trim()
    .notEmpty()
    .withMessage("State is required")
    .isLength({ max: 50 })
    .withMessage("State cannot exceed 50 characters"),
  body("shippingAddress.zipCode")
    .trim()
    .notEmpty()
    .withMessage("Zip code is required")
    .isLength({ max: 20 })
    .withMessage("Zip code cannot exceed 20 characters"),
  body("shippingAddress.country")
    .trim()
    .notEmpty()
    .withMessage("Country is required")
    .isLength({ max: 50 })
    .withMessage("Country cannot exceed 50 characters"),
  body("paymentMethod.cardNumber")
    .notEmpty()
    .withMessage("Card number is required")
    .isLength({ min: 13, max: 19 })
    .withMessage("Card number must be between 13 and 19 digits"),
  body("paymentMethod.expiryDate")
    .notEmpty()
    .withMessage("Expiry date is required")
    .matches(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)
    .withMessage("Expiry date must be in MM/YY format"),
  body("paymentMethod.cvv")
    .notEmpty()
    .withMessage("CVV is required")
    .isLength({ min: 3, max: 4 })
    .withMessage("CVV must be 3 or 4 digits"),
  body("paymentMethod.cardholderName")
    .trim()
    .notEmpty()
    .withMessage("Cardholder name is required")
    .isLength({ max: 100 })
    .withMessage("Cardholder name cannot exceed 100 characters"),
];

const orderIdValidation = [
  param("orderId").isMongoId().withMessage("Invalid order ID format"),
];

// Routes - All routes require authentication

// POST /api/orders - Create new order
router.post("/", requireAuth, createOrderValidation, createOrder);

// GET /api/orders - Get user's orders with pagination
router.get("/", requireAuth, getUserOrders);

// GET /api/orders/:orderId - Get specific order details
router.get("/:orderId", requireAuth, orderIdValidation, getOrderById);

// PUT /api/orders/:orderId/cancel - Cancel order
router.put("/:orderId/cancel", requireAuth, orderIdValidation, cancelOrder);

// GET /api/orders/:orderId/tracking - Get order tracking information
router.get(
  "/:orderId/tracking",
  requireAuth,
  orderIdValidation,
  getOrderTracking
);

export default router;
