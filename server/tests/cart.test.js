import request from "supertest";
import mongoose from "mongoose";
import app from "../server.js";
import User from "../models/User.js";
import Alien from "../models/Alien.js";
import Cart from "../models/Cart.js";
import { generateToken } from "../middleware/auth.js";

describe("Cart API", () => {
  let testUser;
  let testAlien;
  let authToken;

  beforeAll(async () => {
    // Create test user
    testUser = new User({
      email: "carttest@example.com",
      password: "password123",
      firstName: "Cart",
      lastName: "Tester",
    });
    await testUser.save();
    authToken = generateToken(testUser._id);

    // Create test alien
    testAlien = new Alien({
      name: "Test Alien",
      faction: "Test Faction",
      planet: "Test Planet",
      rarity: "Common",
      price: 100,
      image: "https://example.com/test-alien.jpg",
      backstory: "A test alien for cart testing",
      abilities: ["Test ability"],
      clothingStyle: "Test style",
      inStock: true,
    });
    await testAlien.save();
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteOne({ _id: testUser._id });
    await Alien.deleteOne({ _id: testAlien._id });
    await Cart.deleteMany({ user: testUser._id });
  });

  afterEach(async () => {
    // Clean up cart after each test
    await Cart.deleteMany({ user: testUser._id });
  });

  describe("GET /api/cart", () => {
    it("should get empty cart for authenticated user", async () => {
      const response = await request(app)
        .get("/api/cart")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.cart.items).toHaveLength(0);
      expect(response.body.data.cart.totalItems).toBe(0);
      expect(response.body.data.cart.totalPrice).toBe(0);
    });

    it("should get cart with items for authenticated user", async () => {
      // Add item to cart first
      await request(app)
        .post("/api/cart/add")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          alienId: testAlien._id.toString(),
          quantity: 2,
        });

      const response = await request(app)
        .get("/api/cart")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.cart.items).toHaveLength(1);
      expect(response.body.data.cart.totalItems).toBe(2);
      expect(response.body.data.cart.totalPrice).toBe(200);
    });

    it("should get cart for guest user with session", async () => {
      const agent = request.agent(app);

      const response = await agent
        .get("/api/cart")
        .set("x-session-id", "test-session-123");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.cart.items).toHaveLength(0);
    });
  });

  describe("POST /api/cart/add", () => {
    it("should add item to cart for authenticated user", async () => {
      const response = await request(app)
        .post("/api/cart/add")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          alienId: testAlien._id.toString(),
          quantity: 1,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.cart.items).toHaveLength(1);
      expect(response.body.data.cart.items[0].quantity).toBe(1);
      expect(response.body.data.cart.totalItems).toBe(1);
    });

    it("should add multiple quantities of same item", async () => {
      // Add item first time
      await request(app)
        .post("/api/cart/add")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          alienId: testAlien._id.toString(),
          quantity: 2,
        });

      // Add same item again
      const response = await request(app)
        .post("/api/cart/add")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          alienId: testAlien._id.toString(),
          quantity: 3,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.cart.items).toHaveLength(1);
      expect(response.body.data.cart.items[0].quantity).toBe(5);
    });

    it("should not exceed maximum quantity of 10", async () => {
      const response = await request(app)
        .post("/api/cart/add")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          alienId: testAlien._id.toString(),
          quantity: 15,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.cart.items[0].quantity).toBe(10);
    });

    it("should return error for invalid alien ID", async () => {
      const response = await request(app)
        .post("/api/cart/add")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          alienId: "invalid-id",
          quantity: 1,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return error for non-existent alien", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post("/api/cart/add")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          alienId: fakeId.toString(),
          quantity: 1,
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("ALIEN_NOT_FOUND");
    });
  });

  describe("PUT /api/cart/update/:alienId", () => {
    beforeEach(async () => {
      // Add item to cart before each test
      await request(app)
        .post("/api/cart/add")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          alienId: testAlien._id.toString(),
          quantity: 3,
        });
    });

    it("should update item quantity", async () => {
      const response = await request(app)
        .put(`/api/cart/update/${testAlien._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          quantity: 5,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.cart.items[0].quantity).toBe(5);
    });

    it("should remove item when quantity is 0", async () => {
      const response = await request(app)
        .put(`/api/cart/update/${testAlien._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          quantity: 0,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.cart.items).toHaveLength(0);
    });
  });

  describe("DELETE /api/cart/remove/:alienId", () => {
    beforeEach(async () => {
      // Add item to cart before each test
      await request(app)
        .post("/api/cart/add")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          alienId: testAlien._id.toString(),
          quantity: 2,
        });
    });

    it("should remove item from cart", async () => {
      const response = await request(app)
        .delete(`/api/cart/remove/${testAlien._id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.cart.items).toHaveLength(0);
    });
  });

  describe("DELETE /api/cart/clear", () => {
    beforeEach(async () => {
      // Add multiple items to cart
      await request(app)
        .post("/api/cart/add")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          alienId: testAlien._id.toString(),
          quantity: 2,
        });
    });

    it("should clear entire cart", async () => {
      const response = await request(app)
        .delete("/api/cart/clear")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.cart.items).toHaveLength(0);
      expect(response.body.data.cart.totalItems).toBe(0);
    });
  });
});
