import { body, param, query } from "express-validator";
import xss from "xss";

// Custom sanitizer to prevent XSS
const sanitizeHtml = (value) => {
  return xss(value, {
    whiteList: {}, // No HTML tags allowed
    stripIgnoreTag: true,
    stripIgnoreTagBody: ["script"],
  });
};

// Registration validation
export const validateRegistration = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  body("firstName")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("First name cannot exceed 50 characters"),
  body("lastName")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Last name cannot exceed 50 characters"),
];

// Login validation
export const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Profile update validation
export const validateProfileUpdate = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("First name cannot exceed 50 characters"),
  body("lastName")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Last name cannot exceed 50 characters"),
  body("shippingAddress.street")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Street address cannot exceed 100 characters"),
  body("shippingAddress.city")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("City cannot exceed 50 characters"),
  body("shippingAddress.state")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("State cannot exceed 50 characters"),
  body("shippingAddress.zipCode")
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage("Zip code cannot exceed 20 characters"),
  body("shippingAddress.country")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Country cannot exceed 50 characters"),
];

// Change password validation
export const validatePasswordChange = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "New password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
];

// Cart validation
export const validateAddToCart = [
  body("alienId")
    .notEmpty()
    .withMessage("Alien ID is required")
    .isMongoId()
    .withMessage("Invalid alien ID format"),
  body("quantity")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("Quantity must be between 1 and 10"),
];

export const validateUpdateCart = [
  body("quantity")
    .isInt({ min: 1, max: 10 })
    .withMessage("Quantity must be between 1 and 10"),
];

// Order validation
export const validateCreateOrder = [
  body("shippingAddress.street")
    .trim()
    .notEmpty()
    .withMessage("Street address is required")
    .isLength({ max: 200 })
    .withMessage("Street address cannot exceed 200 characters")
    .customSanitizer(sanitizeHtml),
  body("shippingAddress.city")
    .trim()
    .notEmpty()
    .withMessage("City is required")
    .isLength({ max: 100 })
    .withMessage("City cannot exceed 100 characters")
    .customSanitizer(sanitizeHtml),
  body("shippingAddress.state")
    .trim()
    .notEmpty()
    .withMessage("State is required")
    .isLength({ max: 100 })
    .withMessage("State cannot exceed 100 characters")
    .customSanitizer(sanitizeHtml),
  body("shippingAddress.zipCode")
    .trim()
    .notEmpty()
    .withMessage("Zip code is required")
    .matches(/^[0-9]{5}(-[0-9]{4})?$/)
    .withMessage("Invalid zip code format")
    .customSanitizer(sanitizeHtml),
  body("shippingAddress.country")
    .trim()
    .notEmpty()
    .withMessage("Country is required")
    .isLength({ max: 100 })
    .withMessage("Country cannot exceed 100 characters")
    .customSanitizer(sanitizeHtml),
  body("paymentMethod")
    .notEmpty()
    .withMessage("Payment method is required")
    .isIn(["credit_card", "debit_card", "paypal"])
    .withMessage("Invalid payment method"),
];

// Search and filter validation
export const validateAlienSearch = [
  query("search")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Search term cannot exceed 100 characters")
    .customSanitizer(sanitizeHtml),
  query("faction")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Faction filter cannot exceed 50 characters")
    .customSanitizer(sanitizeHtml),
  query("planet")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Planet filter cannot exceed 50 characters")
    .customSanitizer(sanitizeHtml),
  query("rarity")
    .optional()
    .custom((value) => {
      // Allow empty string or valid rarity values
      if (value === "" || value === undefined || value === null) {
        return true;
      }
      return ["Common", "Rare", "Epic", "Legendary"].includes(value);
    })
    .withMessage("Invalid rarity filter"),
  query("minPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum price must be a positive number"),
  query("maxPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Maximum price must be a positive number"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];

// MongoDB ObjectId validation
export const validateObjectId = (paramName = "id") => [
  param(paramName).isMongoId().withMessage(`Invalid ${paramName} format`),
];

// File upload validation
export const validateImageUpload = [
  body("image")
    .optional()
    .custom((value, { req }) => {
      if (req.file) {
        // Check file type
        const allowedTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
        ];
        if (!allowedTypes.includes(req.file.mimetype)) {
          throw new Error("Only JPEG, PNG, and WebP images are allowed");
        }

        // Check file size (5MB max)
        if (req.file.size > 5 * 1024 * 1024) {
          throw new Error("Image size cannot exceed 5MB");
        }
      }
      return true;
    }),
];

// Alien creation validation
export const validateAlienCreation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Alien name is required")
    .isLength({ max: 100 })
    .withMessage("Name cannot exceed 100 characters"),
  body("faction")
    .trim()
    .notEmpty()
    .withMessage("Faction is required")
    .isLength({ max: 50 })
    .withMessage("Faction cannot exceed 50 characters"),
  body("planet")
    .trim()
    .notEmpty()
    .withMessage("Planet is required")
    .isLength({ max: 50 })
    .withMessage("Planet cannot exceed 50 characters"),
  body("rarity")
    .notEmpty()
    .withMessage("Rarity is required")
    .isIn(["Common", "Rare", "Epic", "Legendary"])
    .withMessage("Rarity must be Common, Rare, Epic, or Legendary"),
  body("price")
    .isNumeric()
    .withMessage("Price must be a number")
    .isFloat({ min: 0 })
    .withMessage("Price cannot be negative"),
  body("image").optional().isURL().withMessage("Image must be a valid URL"),
  body("backstory")
    .optional()
    .trim()
    .isLength({ max: 6000 })
    .withMessage("Backstory cannot exceed 6000 characters"),
  body("abilities")
    .optional()
    .isArray()
    .withMessage("Abilities must be an array"),
  body("abilities.*")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Each ability cannot exceed 100 characters"),
  body("clothingStyle")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Clothing style cannot exceed 100 characters"),
  body("featured")
    .optional()
    .isBoolean()
    .withMessage("Featured must be a boolean"),
  body("inStock")
    .optional()
    .isBoolean()
    .withMessage("InStock must be a boolean"),
];

// Alien update validation (same as creation but all fields optional)
export const validateAlienUpdate = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Alien name cannot be empty")
    .isLength({ max: 100 })
    .withMessage("Name cannot exceed 100 characters"),
  body("faction")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Faction cannot be empty")
    .isLength({ max: 50 })
    .withMessage("Faction cannot exceed 50 characters"),
  body("planet")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Planet cannot be empty")
    .isLength({ max: 50 })
    .withMessage("Planet cannot exceed 50 characters"),
  body("rarity")
    .optional()
    .isIn(["Common", "Rare", "Epic", "Legendary"])
    .withMessage("Rarity must be Common, Rare, Epic, or Legendary"),
  body("price")
    .optional()
    .isNumeric()
    .withMessage("Price must be a number")
    .isFloat({ min: 0 })
    .withMessage("Price cannot be negative"),
  body("image").optional().isURL().withMessage("Image must be a valid URL"),
  body("backstory")
    .optional()
    .trim()
    .isLength({ max: 6000 })
    .withMessage("Backstory cannot exceed 6000 characters"),
  body("abilities")
    .optional()
    .isArray()
    .withMessage("Abilities must be an array"),
  body("abilities.*")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Each ability cannot exceed 100 characters"),
  body("clothingStyle")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Clothing style cannot exceed 100 characters"),
  body("featured")
    .optional()
    .isBoolean()
    .withMessage("Featured must be a boolean"),
  body("inStock")
    .optional()
    .isBoolean()
    .withMessage("InStock must be a boolean"),
];
