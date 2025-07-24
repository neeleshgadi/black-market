import express from "express";
import {
  getAliens,
  getAlienById,
  getRelatedAliens,
  createAlien,
  updateAlien,
  deleteAlien,
  getFeaturedAliens,
  getFilterOptions,
} from "../controllers/alienController.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import {
  validateAlienCreation,
  validateAlienUpdate,
  validateAlienSearch,
  validateObjectId,
} from "../middleware/validation.js";
import { handleValidationErrors } from "../middleware/errorHandler.js";
import {
  optionalUploadAlienImage,
  handleUploadError,
} from "../middleware/upload.js";
import {
  alienListCache,
  alienDetailCache,
  cacheMiddleware,
} from "../middleware/cache.js";

const router = express.Router();

// Public routes with caching
router.get(
  "/",
  validateAlienSearch,
  handleValidationErrors,
  alienListCache,
  getAliens
); // GET /api/aliens - Get all aliens with filtering/search/pagination
router.get(
  "/featured",
  cacheMiddleware({ ttl: 900, keyGenerator: () => "aliens:featured" }),
  getFeaturedAliens
); // GET /api/aliens/featured - Get featured aliens
router.get(
  "/filter-options",
  cacheMiddleware({ ttl: 1800, keyGenerator: () => "aliens:filter-options" }),
  getFilterOptions
); // GET /api/aliens/filter-options - Get filter dropdown options
router.get(
  "/:id",
  validateObjectId("id"),
  handleValidationErrors,
  alienDetailCache,
  getAlienById
); // GET /api/aliens/:id - Get single alien
router.get(
  "/:id/related",
  validateObjectId("id"),
  handleValidationErrors,
  cacheMiddleware({
    ttl: 600,
    keyGenerator: (req) => `alien:related:${req.params.id}`,
  }),
  getRelatedAliens
); // GET /api/aliens/:id/related - Get related aliens

// Admin-only routes (require authentication and admin role)
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  optionalUploadAlienImage,
  handleUploadError,
  validateAlienCreation,
  handleValidationErrors,
  createAlien
); // POST /api/aliens - Create new alien

router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  validateObjectId("id"),
  optionalUploadAlienImage,
  handleUploadError,
  validateAlienUpdate,
  handleValidationErrors,
  updateAlien
); // PUT /api/aliens/:id - Update alien

router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  validateObjectId("id"),
  handleValidationErrors,
  deleteAlien
); // DELETE /api/aliens/:id - Delete alien

export default router;
