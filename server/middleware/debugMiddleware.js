// Debug middleware to log requests and headers
console.log('[TOP OF DEBUG MIDDLEWARE] debugMiddleware.js loaded');
export const debugMiddleware = (req, res, next) => {
  console.log(`[MIDDLEWARE] debugMiddleware called for ${req.method} ${req.originalUrl}`);
  console.log(`[DEBUG] ${req.method} ${req.originalUrl}`);
  console.log("[DEBUG] Headers:", req.headers);

  if (req.body && Object.keys(req.body).length > 0) {
    console.log("[DEBUG] Body:", req.body);
  }

  next();
};
