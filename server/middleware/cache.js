import redisService from "../config/redis.js";
import logger from "../utils/logger.js";

// Cache middleware factory
export const cacheMiddleware = (options = {}) => {
  const {
    ttl = 300, // 5 minutes default
    keyGenerator = (req) => `cache:${req.method}:${req.originalUrl}`,
    skipCache = () => false,
    onHit = () => {},
    onMiss = () => {},
  } = options;

  return async (req, res, next) => {
    // Skip caching for non-GET requests or if skipCache returns true
    if (req.method !== "GET" || skipCache(req)) {
      return next();
    }

    // Skip if Redis is not available
    if (!redisService.isReady()) {
      return next();
    }

    const cacheKey = keyGenerator(req);

    try {
      // Try to get cached response
      const cachedResponse = await redisService.get(cacheKey);

      if (cachedResponse) {
        logger.debug(`Cache HIT for key: ${cacheKey}`);
        onHit(cacheKey, req);

        // Set cache headers
        res.set("X-Cache", "HIT");
        res.set("X-Cache-Key", cacheKey);

        return res.status(cachedResponse.status).json(cachedResponse.data);
      }

      logger.debug(`Cache MISS for key: ${cacheKey}`);
      onMiss(cacheKey, req);

      // Store original res.json method
      const originalJson = res.json;

      // Override res.json to cache the response
      res.json = function (data) {
        // Cache successful responses only
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const responseToCache = {
            status: res.statusCode,
            data: data,
            timestamp: new Date().toISOString(),
          };

          // Cache asynchronously (don't wait)
          redisService
            .set(cacheKey, responseToCache, ttl)
            .then(() => {
              logger.debug(`Cached response for key: ${cacheKey}`);
            })
            .catch((error) => {
              logger.error(
                `Failed to cache response for key ${cacheKey}:`,
                error
              );
            });
        }

        // Set cache headers
        res.set("X-Cache", "MISS");
        res.set("X-Cache-Key", cacheKey);

        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error(`Cache middleware error for key ${cacheKey}:`, error);
      next();
    }
  };
};

// Specific cache configurations
export const alienListCache = cacheMiddleware({
  ttl: 600, // 10 minutes for alien listings
  keyGenerator: (req) => {
    const { page = 1, limit = 12, category, search, sort } = req.query;
    return `aliens:list:${page}:${limit}:${category || "all"}:${search || ""}:${
      sort || "newest"
    }`;
  },
  skipCache: (req) => {
    // Skip cache for admin users or if no-cache header is present
    return (
      req.headers["cache-control"] === "no-cache" || req.user?.role === "admin"
    );
  },
});

export const alienDetailCache = cacheMiddleware({
  ttl: 900, // 15 minutes for individual alien details
  keyGenerator: (req) => `alien:detail:${req.params.id}`,
  skipCache: (req) => req.headers["cache-control"] === "no-cache",
});

export const userProfileCache = cacheMiddleware({
  ttl: 300, // 5 minutes for user profiles
  keyGenerator: (req) => `user:profile:${req.user?.id}`,
  skipCache: (req) => !req.user || req.headers["cache-control"] === "no-cache",
});

// Cache invalidation helpers
export const invalidateCache = {
  // Invalidate all alien-related caches
  aliens: async () => {
    await redisService.flushPattern("aliens:*");
    await redisService.flushPattern("alien:*");
    logger.info("Invalidated all alien caches");
  },

  // Invalidate specific alien cache
  alien: async (alienId) => {
    await redisService.del(`alien:detail:${alienId}`);
    await redisService.flushPattern("aliens:list:*");
    logger.info(`Invalidated cache for alien: ${alienId}`);
  },

  // Invalidate user cache
  user: async (userId) => {
    await redisService.del(`user:profile:${userId}`);
    logger.info(`Invalidated cache for user: ${userId}`);
  },

  // Invalidate all caches
  all: async () => {
    await redisService.flushPattern("*");
    logger.info("Invalidated all caches");
  },
};

// Cache warming functions
export const warmCache = {
  // Warm popular aliens cache
  popularAliens: async () => {
    try {
      // This would typically fetch from your alien service
      logger.info("Cache warming for popular aliens started");
      // Implementation would go here
    } catch (error) {
      logger.error("Failed to warm popular aliens cache:", error);
    }
  },
};
