// @ts-ignore
// @ts-ignore
// @ts-ignore
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import authRoutes from "../routes/auth.js";
import User from "../models/User.js";
import { globalErrorHandler } from "../middleware/errorHandler.js";

// Load environment variables
dotenv.config();

// Create test app
const createTestApp = () => {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS configuration
  app.use(cors());

  // Body parsing middleware
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // API routes
  app.use("/api/auth", authRoutes);

  // Use the global error handling middleware
  app.use(globalErrorHandler);

  return app;
};

describe("Authentication Endpoints", () => {
  let mongoServer;
  let app;

  beforeAll(async () => {
    // Disconnect any existing connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Start in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connect to the in-memory database
    await mongoose.connect(mongoUri);

    // Create test app
    app = createTestApp();
  });

  afterAll(async () => {
    // Clean up
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear the database before each test
    await User.deleteMany({});
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        email: "test@example.com",
        password: "Password123",
        firstName: "John",
        lastName: "Doe",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.firstName).toBe(userData.firstName);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined();
    });

    it("should not register user with invalid email", async () => {
      const userData = {
        email: "invalid-email",
        password: "Password123",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should not register user with weak password", async () => {
      const userData = {
        email: "test@example.com",
        password: "weak",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should not register user with existing email", async () => {
      const userData = {
        email: "test@example.com",
        password: "Password123",
      };

      // Register first user
      await request(app).post("/api/auth/register").send(userData).expect(201);

      // Try to register with same email
      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("USER_EXISTS");
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      // Create a test user
      const user = new User({
        email: "test@example.com",
        password: "Password123",
        firstName: "John",
        lastName: "Doe",
      });
      await user.save();
    });

    it("should login user with valid credentials", async () => {
      const loginData = {
        email: "test@example.com",
        password: "Password123",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined();
    });

    it("should not login user with invalid email", async () => {
      const loginData = {
        email: "wrong@example.com",
        password: "Password123",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("INVALID_CREDENTIALS");
    });

    it("should not login user with invalid password", async () => {
      const loginData = {
        email: "test@example.com",
        password: "WrongPassword",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("INVALID_CREDENTIALS");
    });
  });

  describe("GET /api/auth/profile", () => {
    let authToken;
    let userId;

    beforeEach(async () => {
      // Create and login a test user
      const userData = {
        email: "test@example.com",
        password: "Password123",
        firstName: "John",
        lastName: "Doe",
      };

      const registerResponse = await request(app)
        .post("/api/auth/register")
        .send(userData);

      authToken = registerResponse.body.data.token;
      userId = registerResponse.body.data.user.id;
    });

    it("should get user profile with valid token", async () => {
      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe("test@example.com");
      expect(response.body.data.firstName).toBe("John");
    });

    it("should not get profile without token", async () => {
      const response = await request(app).get("/api/auth/profile").expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("NO_TOKEN");
    });

    it("should not get profile with invalid token", async () => {
      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("INVALID_TOKEN");
    });
  });

  describe("PUT /api/auth/profile", () => {
    let authToken;

    beforeEach(async () => {
      // Create and login a test user
      const userData = {
        email: "test@example.com",
        password: "Password123",
        firstName: "John",
        lastName: "Doe",
      };

      const registerResponse = await request(app)
        .post("/api/auth/register")
        .send(userData);

      authToken = registerResponse.body.data.token;
    });

    it("should update user profile successfully", async () => {
      const updateData = {
        firstName: "Jane",
        lastName: "Smith",
        shippingAddress: {
          street: "123 Main St",
          city: "Anytown",
          state: "CA",
          zipCode: "12345",
          country: "USA",
        },
      };

      const response = await request(app)
        .put("/api/auth/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe("Jane");
      expect(response.body.data.lastName).toBe("Smith");
      expect(response.body.data.shippingAddress.street).toBe("123 Main St");
    });

    it("should not update profile without authentication", async () => {
      const updateData = {
        firstName: "Jane",
      };

      const response = await request(app)
        .put("/api/auth/profile")
        .send(updateData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe("Admin Role Tests", () => {
    let adminToken;
    let userToken;

    beforeEach(async () => {
      // Create admin user
      const adminUser = new User({
        email: "admin@example.com",
        password: "AdminPass123",
        firstName: "Admin",
        lastName: "User",
        isAdmin: true,
      });
      await adminUser.save();

      // Create regular user
      const regularUser = new User({
        email: "user@example.com",
        password: "UserPass123",
        firstName: "Regular",
        lastName: "User",
      });
      await regularUser.save();

      // Login both users
      const adminLogin = await request(app)
        .post("/api/auth/login")
        .send({ email: "admin@example.com", password: "AdminPass123" });
      adminToken = adminLogin.body.data.token;

      const userLogin = await request(app)
        .post("/api/auth/login")
        .send({ email: "user@example.com", password: "UserPass123" });
      userToken = userLogin.body.data.token;
    });

    it("should identify admin user correctly", async () => {
      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.isAdmin).toBe(true);
    });

    it("should identify regular user correctly", async () => {
      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.data.isAdmin).toBe(false);
    });
  });
});
