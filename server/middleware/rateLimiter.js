import rateLimit from "express-rate-limit";
import logger from "../utils/logger.js";

// Rate limiter for general API requests
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      message: "Too many requests from this IP, please try again later.",
      code: "RATE_LIMIT_EXCEEDED",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn("Rate limit exceeded", {
      ip: req.ip,
      url: req.url,
      method: req.method,
      userAgent: req.get("User-Agent"),
    });

    res.status(429).json({
      success: false,
      error: {
        message: "Too many requests from this IP, please try again later.",
        code: "RATE_LIMIT_EXCEEDED",
        retryAfter: Math.round(req.rateLimit.resetTime / 1000),
      },
      timestamp: new Date().toISOString(),
    });
  },
});

// Stricter rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // very high limit for development/testing
  message: {
    success: false,
    error: {
      message: "Too many authentication attempts, please try again later.",
      code: "AUTH_RATE_LIMIT_EXCEEDED",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn("Auth rate limit exceeded", {
      ip: req.ip,
      url: req.url,
      method: req.method,
      email: req.body?.email,
      userAgent: req.get("User-Agent"),
    });

    res.status(429).json({
      success: false,
      error: {
        message:
          "Too many authentication attempts from this IP. Please try again in 15 minutes.",
        code: "AUTH_RATE_LIMIT_EXCEEDED",
        retryAfter: Math.round(req.rateLimit.resetTime / 1000),
      },
      timestamp: new Date().toISOString(),
    });
  },
});

// Rate limiter for password reset attempts
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password reset requests per hour
  message: {
    success: false,
    error: {
      message: "Too many password reset attempts, please try again later.",
      code: "PASSWORD_RESET_RATE_LIMIT_EXCEEDED",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn("Password reset rate limit exceeded", {
      ip: req.ip,
      email: req.body?.email,
      userAgent: req.get("User-Agent"),
    });

    res.status(429).json({
      success: false,
      error: {
        message:
          "Too many password reset attempts. Please try again in 1 hour.",
        code: "PASSWORD_RESET_RATE_LIMIT_EXCEEDED",
        retryAfter: Math.round(req.rateLimit.resetTime / 1000),
      },
      timestamp: new Date().toISOString(),
    });
  },
});

export default { generalLimiter, authLimiter, passwordResetLimiter };
