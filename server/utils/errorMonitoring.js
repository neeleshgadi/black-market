import logger from "./logger.js";

// Error monitoring and alerting utilities
class ErrorMonitor {
  constructor() {
    this.errorCounts = new Map();
    this.alertThresholds = {
      error: 10, // Alert after 10 errors in 5 minutes
      warning: 50, // Alert after 50 warnings in 5 minutes
      timeWindow: 5 * 60 * 1000, // 5 minutes
    };
    this.lastAlertTime = new Map();
    this.criticalErrors = new Set([
      "DATABASE_CONNECTION_FAILED",
      "PAYMENT_PROCESSING_FAILED",
      "AUTHENTICATION_SYSTEM_DOWN",
      "CRITICAL_SYSTEM_ERROR",
    ]);
  }

  // Track error occurrence
  trackError(error, context = {}) {
    const errorKey = this.getErrorKey(error);
    const now = Date.now();

    // Initialize tracking for this error type
    if (!this.errorCounts.has(errorKey)) {
      this.errorCounts.set(errorKey, []);
    }

    // Add current timestamp
    const timestamps = this.errorCounts.get(errorKey);
    timestamps.push(now);

    // Clean old timestamps (outside time window)
    const cutoff = now - this.alertThresholds.timeWindow;
    const recentTimestamps = timestamps.filter((ts) => ts > cutoff);
    this.errorCounts.set(errorKey, recentTimestamps);

    // Check if we need to send an alert
    this.checkAlertThreshold(errorKey, recentTimestamps.length, error, context);

    // Log the error
    this.logError(error, context);
  }

  // Generate error key for tracking
  getErrorKey(error) {
    if (error.code) return error.code;
    if (error.name) return error.name;
    if (error.message) return error.message.substring(0, 50);
    return "UNKNOWN_ERROR";
  }

  // Check if alert threshold is reached
  checkAlertThreshold(errorKey, count, error, context) {
    const isCritical = this.criticalErrors.has(errorKey);
    const threshold = isCritical ? 1 : this.alertThresholds.error;

    if (count >= threshold) {
      const lastAlert = this.lastAlertTime.get(errorKey) || 0;
      const now = Date.now();

      // Don't spam alerts - wait at least 15 minutes between alerts for same error
      if (now - lastAlert > 15 * 60 * 1000) {
        this.sendAlert(errorKey, count, error, context, isCritical);
        this.lastAlertTime.set(errorKey, now);
      }
    }
  }

  // Send alert (in production, this would integrate with alerting services)
  sendAlert(errorKey, count, error, context, isCritical) {
    const alertLevel = isCritical ? "CRITICAL" : "WARNING";
    const message = `${alertLevel}: ${errorKey} occurred ${count} times in the last ${
      this.alertThresholds.timeWindow / 60000
    } minutes`;

    logger.error("Error Alert Triggered", {
      alertLevel,
      errorKey,
      count,
      error: error.message,
      context,
      timestamp: new Date().toISOString(),
    });

    // In production, you would send this to:
    // - Slack/Discord webhook
    // - Email alerts
    // - PagerDuty
    // - Sentry
    // - Custom monitoring dashboard

    console.error(`🚨 ${message}`);

    // Example webhook call (commented out)
    // this.sendWebhookAlert(alertLevel, errorKey, count, error, context);
  }

  // Log error with appropriate level
  logError(error, context) {
    const errorKey = this.getErrorKey(error);
    const isCritical = this.criticalErrors.has(errorKey);

    if (isCritical) {
      logger.error("Critical Error", {
        error: error.message,
        stack: error.stack,
        context,
      });
    } else if (error.statusCode >= 500) {
      logger.error("Server Error", { error: error.message, context });
    } else if (error.statusCode >= 400) {
      logger.warn("Client Error", { error: error.message, context });
    } else {
      logger.info("Application Error", { error: error.message, context });
    }
  }

  // Get error statistics
  getErrorStats() {
    const stats = {};
    const now = Date.now();
    const cutoff = now - this.alertThresholds.timeWindow;

    for (const [errorKey, timestamps] of this.errorCounts.entries()) {
      const recentCount = timestamps.filter((ts) => ts > cutoff).length;
      if (recentCount > 0) {
        stats[errorKey] = recentCount;
      }
    }

    return stats;
  }

  // Health check for error rates
  getHealthStatus() {
    const stats = this.getErrorStats();
    const totalErrors = Object.values(stats).reduce(
      (sum, count) => sum + count,
      0
    );

    let status = "healthy";
    let message = "All systems operating normally";

    if (totalErrors > 100) {
      status = "critical";
      message = `High error rate detected: ${totalErrors} errors in last 5 minutes`;
    } else if (totalErrors > 50) {
      status = "warning";
      message = `Elevated error rate: ${totalErrors} errors in last 5 minutes`;
    } else if (totalErrors > 20) {
      status = "degraded";
      message = `Moderate error rate: ${totalErrors} errors in last 5 minutes`;
    }

    return {
      status,
      message,
      errorCount: totalErrors,
      errorBreakdown: stats,
      timestamp: new Date().toISOString(),
    };
  }

  // Clear old error data (call periodically)
  cleanup() {
    const now = Date.now();
    const cutoff = now - this.alertThresholds.timeWindow * 2; // Keep data for 2x time window

    for (const [errorKey, timestamps] of this.errorCounts.entries()) {
      const recentTimestamps = timestamps.filter((ts) => ts > cutoff);
      if (recentTimestamps.length === 0) {
        this.errorCounts.delete(errorKey);
      } else {
        this.errorCounts.set(errorKey, recentTimestamps);
      }
    }

    // Clean up alert timestamps
    for (const [errorKey, timestamp] of this.lastAlertTime.entries()) {
      if (now - timestamp > 24 * 60 * 60 * 1000) {
        // 24 hours
        this.lastAlertTime.delete(errorKey);
      }
    }
  }

  // Example webhook alert (customize for your needs)
  async sendWebhookAlert(alertLevel, errorKey, count, error, context) {
    try {
      const webhookUrl = process.env.ALERT_WEBHOOK_URL;
      if (!webhookUrl) return;

      const payload = {
        text: `🚨 ${alertLevel}: ${errorKey}`,
        attachments: [
          {
            color: alertLevel === "CRITICAL" ? "danger" : "warning",
            fields: [
              { title: "Error", value: errorKey, short: true },
              { title: "Count", value: count.toString(), short: true },
              { title: "Message", value: error.message, short: false },
              {
                title: "Environment",
                value: process.env.NODE_ENV,
                short: true,
              },
            ],
            timestamp: Math.floor(Date.now() / 1000),
          },
        ],
      };

      // In a real implementation, you'd use fetch or axios here
      // await fetch(webhookUrl, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // });
    } catch (err) {
      logger.error("Failed to send webhook alert", { error: err.message });
    }
  }
}

// Create singleton instance
const errorMonitor = new ErrorMonitor();

// Cleanup old data every 10 minutes
setInterval(() => {
  errorMonitor.cleanup();
}, 10 * 60 * 1000);

export default errorMonitor;
