import fs from "fs";
import path from "path";

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || "INFO";
  }

  formatMessage(level, message, meta = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta,
    });
  }

  writeToFile(filename, message) {
    const filePath = path.join(logsDir, filename);
    const logEntry = message + "\n";

    fs.appendFile(filePath, logEntry, (err) => {
      if (err) {
        console.error("Failed to write to log file:", err);
      }
    });
  }

  shouldLog(level) {
    return LOG_LEVELS[level] <= LOG_LEVELS[this.logLevel];
  }

  error(message, meta = {}) {
    if (!this.shouldLog("ERROR")) return;

    const formattedMessage = this.formatMessage("ERROR", message, meta);
    console.error(formattedMessage);
    this.writeToFile("error.log", formattedMessage);
    this.writeToFile("combined.log", formattedMessage);
  }

  warn(message, meta = {}) {
    if (!this.shouldLog("WARN")) return;

    const formattedMessage = this.formatMessage("WARN", message, meta);
    console.warn(formattedMessage);
    this.writeToFile("combined.log", formattedMessage);
  }

  info(message, meta = {}) {
    if (!this.shouldLog("INFO")) return;

    const formattedMessage = this.formatMessage("INFO", message, meta);
    console.info(formattedMessage);
    this.writeToFile("combined.log", formattedMessage);
  }

  debug(message, meta = {}) {
    if (!this.shouldLog("DEBUG")) return;

    const formattedMessage = this.formatMessage("DEBUG", message, meta);
    console.debug(formattedMessage);
    this.writeToFile("debug.log", formattedMessage);
    this.writeToFile("combined.log", formattedMessage);
  }

  // Log HTTP requests
  logRequest(req, res, responseTime) {
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      userId: req.user?.id || null,
    };

    if (res.statusCode >= 400) {
      this.error("HTTP Error", logData);
    } else {
      this.info("HTTP Request", logData);
    }
  }

  // Log authentication events
  logAuth(event, userId, meta = {}) {
    this.info(`Auth: ${event}`, {
      userId,
      ...meta,
    });
  }

  // Log business events
  logBusiness(event, meta = {}) {
    this.info(`Business: ${event}`, meta);
  }
}

export default new Logger();
