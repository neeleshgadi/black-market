import express from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import {
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange,
} from "../middleware/validation.js";
import { handleValidationErrors } from "../middleware/errorHandler.js";

const router = express.Router();

// Public routes
router.post(
  "/register",
  validateRegistration,
  handleValidationErrors,
  register
);
router.post("/login", validateLogin, handleValidationErrors, login);

// Protected routes (require authentication)
router.get("/profile", requireAuth, getProfile);
router.put(
  "/profile",
  requireAuth,
  validateProfileUpdate,
  handleValidationErrors,
  updateProfile
);
router.put(
  "/change-password",
  requireAuth,
  validatePasswordChange,
  handleValidationErrors,
  changePassword
);

export default router;
