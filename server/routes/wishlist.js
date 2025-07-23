import express from "express";
import { body, param } from "express-validator";
import { requireAuth } from "../middleware/auth.js";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlistStatus,
  clearWishlist,
} from "../controllers/wishlistController.js";

const router = express.Router();

// All wishlist routes require authentication
router.use(requireAuth);

// GET /api/wishlist - Get user's wishlist
router.get("/", getWishlist);

// POST /api/wishlist/add - Add alien to wishlist
router.post(
  "/add",
  [
    body("alienId")
      .notEmpty()
      .withMessage("Alien ID is required")
      .isMongoId()
      .withMessage("Invalid alien ID format"),
  ],
  addToWishlist
);

// DELETE /api/wishlist/remove/:alienId - Remove alien from wishlist
router.delete(
  "/remove/:alienId",
  [param("alienId").isMongoId().withMessage("Invalid alien ID format")],
  removeFromWishlist
);

// GET /api/wishlist/check/:alienId - Check if alien is in wishlist
router.get(
  "/check/:alienId",
  [param("alienId").isMongoId().withMessage("Invalid alien ID format")],
  checkWishlistStatus
);

// DELETE /api/wishlist/clear - Clear entire wishlist
router.delete("/clear", clearWishlist);

export default router;
