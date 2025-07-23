import logger from "./logger.js";

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
  }

  // Start timing an operation
  startTimer(operationName) {
    const startTime = process.hrtime.bigint();
    this.metrics.set(operationName, { startTime, endTime: null });
    return operationName;
  }

  // End timing an operation
  endTimer(operationName) {
    const metric = this.metrics.get(operationName);
    if (!metric) {
      logger.warn(`Timer not found for operation: ${operationName}`);
      return null;
    }

    metric.endTime = process.hrtime.bigint();
    const duration = Number(metric.endTime - metric.startTime) / 1000000; // Convert to milliseconds

    logger.info(`Performance: ${operationName} took ${duration.toFixed(2)}ms`);

    // Clean up
    this.metrics.delete(operationName);

    return duration;
  }

  // Middleware to monitor API response times
  apiResponseTime() {
    return (req, res, next) => {
      const startTime = process.hrtime.bigint();
      const operationName = `${req.method} ${req.path}`;

      res.on("finish", () => {
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1000000;

        // Log slow requests (> 1000ms)
        if (duration > 1000) {
          logger.warn(
            `Slow API request: ${operationName} took ${duration.toFixed(2)}ms`,
            {
              method: req.method,
              path: req.path,
              duration: duration,
              statusCode: res.statusCode,
            }
          );
        }

        // Add response time header (only if headers haven't been sent)
        if (!res.headersSent) {
          res.set("X-Response-Time", `${duration.toFixed(2)}ms`);
        }
      });

      next();
    };
  }

  // Monitor database query performance
  async monitorDbQuery(queryName, queryFunction) {
    const startTime = process.hrtime.bigint();

    try {
      const result = await queryFunction();
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000;

      // Log slow queries (> 500ms)
      if (duration > 500) {
        logger.warn(
          `Slow database query: ${queryName} took ${duration.toFixed(2)}ms`
        );
      }

      return result;
    } catch (error) {
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000;

      logger.error(
        `Database query failed: ${queryName} after ${duration.toFixed(2)}ms`,
        {
          error: error.message,
          duration: duration,
        }
      );

      throw error;
    }
  }

  // Get memory usage statistics
  getMemoryUsage() {
    const usage = process.memoryUsage();
    return {
      rss: Math.round(usage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024), // MB
    };
  }

  // Log system performance metrics
  logSystemMetrics() {
    const memory = this.getMemoryUsage();
    const uptime = Math.round(process.uptime());

    logger.info("System Performance Metrics", {
      memory: memory,
      uptime: `${uptime}s`,
      nodeVersion: process.version,
    });
  }
}

const performanceMonitor = new PerformanceMonitor();

// Log system metrics every 5 minutes in production
if (process.env.NODE_ENV === "production") {
  setInterval(() => {
    performanceMonitor.logSystemMetrics();
  }, 5 * 60 * 1000);
}

export default performanceMonitor;
