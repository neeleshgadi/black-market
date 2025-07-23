import express from "express";
import {
  getDashboardAnalytics,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  updateUserAdminStatus,
  getAllAliens,
  createAlien,
  updateAlien,
  deleteAlien,
  toggleAlienFeatured,
  toggleAlienStock,
  getSystemMetrics,
} from "../controllers/adminController.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import {
  optionalUploadAlienImage,
  handleUploadError,
} from "../middleware/upload.js";

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard analytics
router.get("/analytics", getDashboardAnalytics); // GET /api/admin/analytics

// Order management
router.get("/orders", getAllOrders); // GET /api/admin/orders
router.put("/orders/:orderId", updateOrderStatus); // PUT /api/admin/orders/:orderId

// User management
router.get("/users", getAllUsers); // GET /api/admin/users
router.put("/users/:userId/admin", updateUserAdminStatus); // PUT /api/admin/users/:userId/admin

// Alien management
router.get("/aliens", getAllAliens); // GET /api/admin/aliens
router.post(
  "/aliens",
  optionalUploadAlienImage,
  handleUploadError,
  createAlien
); // POST /api/admin/aliens
router.put(
  "/aliens/:alienId",
  optionalUploadAlienImage,
  handleUploadError,
  updateAlien
); // PUT /api/admin/aliens/:alienId
router.delete("/aliens/:alienId", deleteAlien); // DELETE /api/admin/aliens/:alienId
router.put("/aliens/:alienId/featured", toggleAlienFeatured); // PUT /api/admin/aliens/:alienId/featured
router.put("/aliens/:alienId/stock", toggleAlienStock); // PUT /api/admin/aliens/:alienId/stock

// System metrics
router.get("/metrics", getSystemMetrics); // GET /api/admin/metrics

// TEMP DEBUG: Get all carts (admin only)
import Cart from '../models/Cart.js';
import User from '../models/User.js';
router.get('/carts', requireAdmin, async (req, res) => {
  try {
    const carts = await Cart.find({}).populate('user', 'email').lean();
    res.status(200).json({ success: true, carts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
