import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import session from "express-session";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/database.js";
import redisService from "./config/redis.js";
import {
  globalErrorHandler,
  notFoundHandler,
} from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { requestIdMiddleware } from "./middleware/requestId.js";
import { generalLimiter, authLimiter } from "./middleware/rateLimiter.js";
import logger from "./utils/logger.js";
import errorMonitor from "./utils/errorMonitoring.js";
import performanceMonitor from "./utils/performance.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB and Redis
connectDB().then(async () => {
  // Ensure admin user exists after database connection
  const { ensureAdminExists } = await import("./utils/ensureAdmin.js");
  await ensureAdminExists();
});

// Connect to Redis
redisService.connect().catch((error) => {
  logger.error("Failed to connect to Redis:", error);
  // App continues without Redis - caching will be disabled
});

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: [
          "'self'",
          "data:",
          "https:",
          "http:",
          "http://localhost:5000",
          "http://localhost:3000",
        ],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        manifestSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Request ID middleware (for tracking)
app.use(requestIdMiddleware);

// Rate limiting
app.use("/api/", generalLimiter);
app.use("/api/auth", authLimiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_URL || "http://localhost:3000",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ];

    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-Session-ID",
  ],
  exposedHeaders: ["X-Total-Count", "Set-Cookie"],
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));

// Compression middleware
app.use(
  compression({
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
    level: 6,
    threshold: 1024,
  })
);

// Session middleware for guest cart support
app.use(
  session({
    secret: process.env.SESSION_SECRET || "black-market-session-secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "lax", // Allow cookies in cross-site requests
    },
    name: "black_market_session", // Custom session name
  })
);

// Removed old cart middleware imports - no longer needed

// Cart debugging middlewares removed - no longer needed with simple cart system

// Request logging middleware
app.use(requestLogger);

// Performance monitoring middleware
app.use(performanceMonitor.apiResponseTime());

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files (uploaded images)
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files (uploaded images) with CORS headers
app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "uploads"))
);

// Health check endpoint
app.get("/api/health", async (req, res) => {
  console.log("[HEALTH ENDPOINT] /api/health was called");
  const healthStatus = errorMonitor.getHealthStatus();

  // Add database info
  const dbInfo = {
    connected: mongoose.connection.readyState === 1,
    name: mongoose.connection.name,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
  };

  // Add Redis info
  const redisInfo = {
    connected: redisService.isReady(),
    status: redisService.isReady() ? "connected" : "disconnected",
  };

  // Quick alien count
  let alienCount = 0;
  try {
    alienCount = await Alien.countDocuments();
  } catch (error) {
    console.error("Error counting aliens:", error);
  }

  res.status(healthStatus.status === "critical" ? 503 : 200).json({
    success: healthStatus.status !== "critical",
    message: "Black Market API is running",
    health: healthStatus,
    database: dbInfo,
    redis: redisInfo,
    alienCount,
    timestamp: new Date().toISOString(),
  });
});

// Import routes
import authRoutes from "./routes/auth.js";
import alienRoutes from "./routes/aliens.js";
import cartRoutes from "./routes/cart.js";
import orderRoutes from "./routes/orders.js";
import wishlistRoutes from "./routes/wishlist.js";
import adminRoutes from "./routes/admin.js";
import { Alien } from "./models/index.js";

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/aliens", alienRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/admin", adminRoutes);

// Handle 404 routes
app.use("*", (req, res, next) => {
  console.log(
    `[404 HANDLER] Falling through to 404 for ${req.method} ${req.originalUrl}`
  );
  return notFoundHandler(req, res, next);
});

// Global error handling middleware (must be last)
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;

// Only start server if not in test environment
import fs from "fs";
const logStream = fs.createWriteStream(path.join(__dirname, "console.log"), {
  flags: "a",
});
console.log(
  `[TOP OF SERVER.JS] server.js loaded at ${new Date().toISOString()}`
);
const origLog = console.log;
const origErr = console.error;
console.log = (...args) => {
  origLog(...args);
  logStream.write(
    "[LOG] " +
      args
        .map((a) => (typeof a === "object" ? JSON.stringify(a) : a))
        .join(" ") +
      "\n"
  );
};
console.error = (...args) => {
  origErr(...args);
  logStream.write(
    "[ERROR] " +
      args
        .map((a) => (typeof a === "object" ? JSON.stringify(a) : a))
        .join(" ") +
      "\n"
  );
};

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    logger.info(`Server started on port ${PORT}`, {
      port: PORT,
      environment: process.env.NODE_ENV || "development",
    });
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

export default app;
