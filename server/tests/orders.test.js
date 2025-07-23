import request from "supertest";
import mongoose from "mongoose";
import app from "../server.js";
import User from "../models/User.js";
import Alien from "../models/Alien.js";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import { generateToken } from "../middleware/auth.js";

describe("Orders API", () => {
  let testUser;
  let testAlien;
  let authToken;
  let testCart;

  beforeAll(async () => {
    // Create test user
    testUser = new User({
      email: "ordertest@example.com",
      password: "password123",
      firstName: "Order",
      lastName: "Tester",
    });
    await testUser.save();
    authToken = generateToken(testUser._id);

    // Create test alien
    testAlien = new Alien({
      name: "Test Order Alien",
      faction: "Test Faction",
      planet: "Test Planet",
      rarity: "Common",
      price: 150,
      image: "https://example.com/test-order-alien.jpg",
      backstory: "A test alien for order testing",
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
    await Order.deleteMany({ user: testUser._id });
  });

  beforeEach(async () => {
    // Create cart with items before each test
    testCart = new Cart({
      user: testUser._id,
      items: [
        {
          alien: testAlien._id,
          quantity: 2,
        },
      ],
    });
    await testCart.save();
  });

  afterEach(async () => {
    // Clean up after each test
    await Cart.deleteMany({ user: testUser._id });
    await Order.deleteMany({ user: testUser._id });
  });

  describe("POST /api/orders", () => {
    const validOrderData = {
      shippingAddress: {
        street: "123 Test Street",
        city: "Test City",
        state: "Test State",
        zipCode: "12345",
        country: "Test Country",
      },
      paymentMethod: {
        cardNumber: "4111111111111111",
        expiryDate: "12/25",
        cvv: "123",
        cardholderName: "Test User",
      },
    };

    it("should create order successfully", async () => {
      const response = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${authToken}`)
        .send(validOrderData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.order.items).toHaveLength(1);
      expect(response.body.data.order.totalAmount).toBe(300); // 2 * 150
      expect(response.body.data.order.paymentStatus).toBe("completed");
      expect(response.body.data.order.orderStatus).toBe("confirmed");
      expect(response.body.data.order.orderNumber).toBeDefined();
    });

    it("should fail with empty cart", async () => {
      // Clear the cart first
      await Cart.deleteMany({ user: testUser._id });

      const response = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${authToken}`)
        .send(validOrderData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("EMPTY_CART");
    });

    it("should fail with invalid shipping address", async () => {
      const invalidOrderData = {
        ...validOrderData,
        shippingAddress: {
          street: "", // Empty street
          city: "Test City",
          state: "Test State",
          zipCode: "12345",
          country: "Test Country",
        },
      };

      const response = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${authToken}`)
        .send(invalidOrderData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should fail with invalid payment method", async () => {
      const invalidOrderData = {
        ...validOrderData,
        paymentMethod: {
          cardNumber: "123", // Invalid card number
          expiryDate: "12/25",
          cvv: "123",
          cardholderName: "Test User",
        },
      };

      const response = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${authToken}`)
        .send(invalidOrderData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should fail when alien is out of stock", async () => {
      // Mark alien as out of stock
      testAlien.inStock = false;
      await testAlien.save();

      const response = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${authToken}`)
        .send(validOrderData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("OUT_OF_STOCK");

      // Reset alien stock status
      testAlien.inStock = true;
      await testAlien.save();
    });

    it("should require authentication", async () => {
      const response = await request(app)
        .post("/api/orders")
        .send(validOrderData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/orders", () => {
    let testOrder;

    beforeEach(async () => {
      // Create test order
      testOrder = new Order({
        user: testUser._id,
        items: [
          {
            alien: testAlien._id,
            quantity: 1,
            price: testAlien.price,
          },
        ],
        totalAmount: testAlien.price,
        shippingAddress: {
          street: "123 Test Street",
          city: "Test City",
          state: "Test State",
          zipCode: "12345",
          country: "Test Country",
        },
        paymentStatus: "completed",
        orderStatus: "confirmed",
      });
      await testOrder.save();
    });

    it("should get user orders", async () => {
      const response = await request(app)
        .get("/api/orders")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.orders).toHaveLength(1);
      expect(response.body.data.orders[0].orderNumber).toBe(
        testOrder.orderNumber
      );
      expect(response.body.data.pagination).toBeDefined();
    });

    it("should support pagination", async () => {
      const response = await request(app)
        .get("/api/orders?page=1&limit=5")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.pagination.currentPage).toBe(1);
    });

    it("should require authentication", async () => {
      const response = await request(app).get("/api/orders");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/orders/:orderId", () => {
    let testOrder;

    beforeEach(async () => {
      testOrder = new Order({
        user: testUser._id,
        items: [
          {
            alien: testAlien._id,
            quantity: 1,
            price: testAlien.price,
          },
        ],
        totalAmount: testAlien.price,
        shippingAddress: {
          street: "123 Test Street",
          city: "Test City",
          state: "Test State",
          zipCode: "12345",
          country: "Test Country",
        },
        paymentStatus: "completed",
        orderStatus: "confirmed",
      });
      await testOrder.save();
    });

    it("should get specific order details", async () => {
      const response = await request(app)
        .get(`/api/orders/${testOrder._id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.order.orderNumber).toBe(testOrder.orderNumber);
      expect(response.body.data.order.shippingAddress).toBeDefined();
    });

    it("should return 404 for non-existent order", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/orders/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("ORDER_NOT_FOUND");
    });
  });

  describe("PUT /api/orders/:orderId/cancel", () => {
    let testOrder;

    beforeEach(async () => {
      testOrder = new Order({
        user: testUser._id,
        items: [
          {
            alien: testAlien._id,
            quantity: 1,
            price: testAlien.price,
          },
        ],
        totalAmount: testAlien.price,
        shippingAddress: {
          street: "123 Test Street",
          city: "Test City",
          state: "Test State",
          zipCode: "12345",
          country: "Test Country",
        },
        paymentStatus: "completed",
        orderStatus: "confirmed",
      });
      await testOrder.save();
    });

    it("should cancel order successfully", async () => {
      const response = await request(app)
        .put(`/api/orders/${testOrder._id}/cancel`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.order.orderStatus).toBe("cancelled");
      expect(response.body.data.order.paymentStatus).toBe("refunded");
    });

    it("should not cancel shipped order", async () => {
      testOrder.orderStatus = "shipped";
      await testOrder.save();

      const response = await request(app)
        .put(`/api/orders/${testOrder._id}/cancel`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("CANNOT_CANCEL_ORDER");
    });
  });

  describe("GET /api/orders/:orderId/tracking", () => {
    let testOrder;

    beforeEach(async () => {
      testOrder = new Order({
        user: testUser._id,
        items: [
          {
            alien: testAlien._id,
            quantity: 1,
            price: testAlien.price,
          },
        ],
        totalAmount: testAlien.price,
        shippingAddress: {
          street: "123 Test Street",
          city: "Test City",
          state: "Test State",
          zipCode: "12345",
          country: "Test Country",
        },
        paymentStatus: "completed",
        orderStatus: "confirmed",
      });
      await testOrder.save();
    });

    it("should get order tracking information", async () => {
      const response = await request(app)
        .get(`/api/orders/${testOrder._id}/tracking`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tracking.orderNumber).toBe(
        testOrder.orderNumber
      );
      expect(response.body.data.tracking.currentStatus).toBe("confirmed");
      expect(response.body.data.tracking.timeline).toBeDefined();
      expect(Array.isArray(response.body.data.tracking.timeline)).toBe(true);
    });
  });
});
