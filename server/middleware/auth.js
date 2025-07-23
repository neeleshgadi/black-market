import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// Verify JWT token middleware
export const authenticateToken = async (req, res, next) => {
  // DEBUG: Log incoming token
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  console.log('[AUTH DEBUG] Incoming token:', token);

  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Access token is required",
          code: "NO_TOKEN",
        },
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[AUTH DEBUG] Decoded JWT:', decoded);
    const user = await User.findById(decoded.userId).select("-password");
    console.log('[AUTH DEBUG] User lookup result:', user ? {id: user._id, email: user.email, isAdmin: user.isAdmin} : null);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Invalid token - user not found",
          code: "INVALID_TOKEN",
        },
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: {
          message: "Invalid token",
          code: "INVALID_TOKEN",
        },
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: {
          message: "Token has expired",
          code: "TOKEN_EXPIRED",
        },
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        message: "Authentication error",
        code: "AUTH_ERROR",
      },
    });
  }
};

// Admin role middleware
export const requireAdmin = (req, res, next) => {
  console.log('[AUTH DEBUG] requireAdmin req.user:', req.user);

  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      },
    });
  }

  if (!req.user.isAdmin) {
    console.log('[AUTH DEBUG] Admin check failed: isAdmin is not true');
    return res.status(403).json({
      success: false,
      error: {
        message: "Admin access required",
        code: "ADMIN_REQUIRED",
      },
    });
  }

  next();
};

// Required authentication middleware (alias for authenticateToken)
export const requireAuth = authenticateToken;

// Optional authentication middleware (for features that work with or without auth)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-password");
      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};
