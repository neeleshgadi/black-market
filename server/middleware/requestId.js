import { randomUUID } from "crypto";

// Middleware to add unique request ID for tracking
export const requestIdMiddleware = (req, res, next) => {
  req.id = randomUUID();
  res.setHeader("X-Request-ID", req.id);
  next();
};

export default requestIdMiddleware;
