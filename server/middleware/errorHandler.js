import { validationResult } from "express-validator";
import logger from "../utils/logger.js";
import errorMonitor from "../utils/errorMonitoring.js";

// Custom error class for application errors
export class AppError extends Error {
  constructor(message, statusCode, code = null, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Business logic error class
export class BusinessError extends AppError {
  constructor(message, code = null, details = null) {
    super(message, 400, code, details);
  }
}

// Authentication error class
export class AuthError extends AppError {
  constructor(message, code = "AUTH_ERROR", details = null) {
    super(message, 401, code, details);
  }
}

// Authorization error class
export class AuthorizationError extends AppError {
  constructor(
    message = "Access denied",
    code = "ACCESS_DENIED",
    details = null
  ) {
    super(message, 403, code, details);
  }
}

// Not found error class
export class NotFoundError extends AppError {
  constructor(
    message = "Resource not found",
    code = "NOT_FOUND",
    details = null
  ) {
    super(message, 404, code, details);
  }
}

// Validation error handler middleware
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.path || error.param,
      message: error.msg,
      value: process.env.NODE_ENV === "development" ? error.value : undefined,
      location: error.location,
    }));

    // Log validation errors for monitoring
    logger.warn("Validation Error", {
      url: req.url,
      method: req.method,
      userId: req.user?.id || null,
      errors: formattedErrors,
      body: req.body,
    });

    return res.status(400).json({
      success: false,
      error: {
        message: "Validation failed. Please check your input and try again.",
        code: "VALIDATION_ERROR",
        details: formattedErrors,
      },
      timestamp: new Date().toISOString(),
    });
  }
  next();
};

// MongoDB error handler
const handleMongoError = (error) => {
  if (error.code === 11000) {
    // Duplicate key error
    const field = Object.keys(error.keyValue)[0];
    const value = error.keyValue[field];
    return new AppError(
      `${
        field.charAt(0).toUpperCase() + field.slice(1)
      } '${value}' already exists`,
      409,
      "DUPLICATE_FIELD"
    );
  }

  if (error.name === "ValidationError") {
    // Mongoose validation error
    const errors = Object.values(error.errors).map((err) => ({
      field: err.path,
      message: err.message,
      value: err.value,
    }));
    return new AppError("Validation failed", 400, "VALIDATION_ERROR", errors);
  }

  if (error.name === "CastError") {
    // Invalid ObjectId
    return new AppError("Invalid ID format", 400, "INVALID_ID");
  }

  return error;
};

// JWT error handler
const handleJWTError = (error) => {
  if (error.name === "JsonWebTokenError") {
    return new AppError("Invalid token", 401, "INVALID_TOKEN");
  }

  if (error.name === "TokenExpiredError") {
    return new AppError("Token has expired", 401, "TOKEN_EXPIRED");
  }

  return error;
};

// Global error handling middleware
export const globalErrorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Enhanced error logging with context
  const errorContext = {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    userId: req.user?.id || null,
    body: req.method !== "GET" ? req.body : undefined,
    params: req.params,
    query: req.query,
    timestamp: new Date().toISOString(),
    statusCode: err.statusCode || 500,
    code: err.code || "INTERNAL_ERROR",
  };

  // Log based on error severity
  if (err.statusCode >= 500 || !err.isOperational) {
    logger.error("Server Error", errorContext);
  } else if (err.statusCode >= 400) {
    logger.warn("Client Error", errorContext);
  } else {
    logger.info("Request Error", errorContext);
  }

  // Track error for monitoring
  errorMonitor.trackError(err, errorContext);

  // Handle specific error types
  if (
    err.code === 11000 ||
    err.name === "ValidationError" ||
    err.name === "CastError"
  ) {
    error = handleMongoError(err);
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    error = handleJWTError(err);
  }

  // Handle Multer errors (file upload)
  if (err.code === "LIMIT_FILE_SIZE") {
    error = new AppError("File too large", 413, "FILE_TOO_LARGE");
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    error = new AppError("Unexpected file field", 400, "UNEXPECTED_FILE");
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const code = error.code || "INTERNAL_ERROR";

  // Don't leak sensitive information in production
  const isDevelopment = process.env.NODE_ENV === "development";

  res.status(statusCode).json({
    success: false,
    error: {
      message: error.message || "Internal Server Error",
      code,
      ...(error.details && { details: error.details }),
      ...(isDevelopment && { stack: error.stack }),
      ...(isDevelopment && { url: req.url, method: req.method }),
    },
    timestamp: new Date().toISOString(),
    requestId: req.id || null, // If you add request ID middleware
  });
};

// Async error wrapper to catch async errors
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 404 handler
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.originalUrl} not found`,
      code: "NOT_FOUND",
    },
  });
};
