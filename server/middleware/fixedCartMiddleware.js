// Middleware to use a fixed cart ID for all requests
console.log('[TOP OF FIXED CART MIDDLEWARE] fixedCartMiddleware.js loaded');
import { v4 as uuidv4 } from "uuid";
export const fixedCartMiddleware = (req, res, next) => {
  const requestId = uuidv4();
  console.log(`[MIDDLEWARE] Request ID: ${requestId} - fixedCartMiddleware called for ${req.method} ${req.originalUrl}`);
  const fixedSessionId = "fixed_cart_session_id_123";
  // Only set fixed session ID if user is NOT authenticated
  if (!req.user) {
    console.log(
      `[fixedCartMiddleware] Request ID: ${requestId} - Setting fixed session ID: ${fixedSessionId}`
    );
    console.log(`[fixedCartMiddleware] Original sessionID: ${req.sessionID}`);
    req.sessionID = fixedSessionId;
    // Also set it in headers for good measure
    req.headers["x-session-id"] = fixedSessionId;
  }
  next();
};
