import request from "supertest";
import mongoose from "mongoose";
import app from "../server.js";
import User from "../models/User.js";
import Alien from "../models/Alien.js";
import { generateToken } from "../middleware/auth.js";

describe("Wishlist API", () => {
  let testUser;
  let testAlien1;
  let testAlien2;
  let authToken;

  beforeEach(async () => {
    // Clear the database
    await User.deleteMany({});
    await Alien.deleteMany({});

    // Create test user
    testUser = new User({
      email: "test@example.com",
      password: "password123",
      firstName: "Test",
      lastName: "User",
    });
    await testUser.save();

    // Generate auth token
    authToken = generateToken(testUser._id);

    // Create test aliens
    testAlien1 = new Alien({
      name: "Zephyr",
      faction: "Galactic Federation",
      planet: "Kepler-442b",
      rarity: "Rare",
      price: 150,
      image: "https://example.com/uploads/zephyr.jpg",
      backstory: "A mysterious alien from the outer rim.",
      abilities: ["Telepathy", "Energy Manipulation"],
      clothingStyle: "Ceremonial Robes",
      inStock: true,
    });
    await testAlien1.save();

    testAlien2 = new Alien({
      name: "Vortex",
      faction: "Shadow Syndicate",
      planet: "Proxima Centauri b",
      rarity: "Epic",
      price: 300,
      image: "https://example.com/uploads/vortex.jpg",
      backstory: "A powerful warrior from the shadow realm.",
      abilities: ["Shadow Manipulation", "Combat Mastery"],
      clothingStyle: "Battle Armor",
      inStock: true,
    });
    await testAlien2.save();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("GET /api/wishlist", () => {
    it("should get empty wishlist for new user", async () => {
      const response = await request(app)
        .get("/api/wishlist")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.wishlist).toEqual([]);
      expect(response.body.data.count).toBe(0);
    });

    it("should get wishlist with aliens", async () => {
      // Add aliens to wishlist
      testUser.wishlist = [testAlien1._id, testAlien2._id];
      await testUser.save();

      const response = await request(app)
        .get("/api/wishlist")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.wishlist).toHaveLength(2);
      expect(response.body.data.count).toBe(2);
      expect(response.body.data.wishlist[0].name).toBe("Zephyr");
      expect(response.body.data.wishlist[1].name).toBe("Vortex");
    });

    it("should require authentication", async () => {
      const response = await request(app).get("/api/wishlist");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("NO_TOKEN");
    });
  });

  describe("POST /api/wishlist/add", () => {
    it("should add alien to wishlist", async () => {
      const response = await request(app)
        .post("/api/wishlist/add")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ alienId: testAlien1._id });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.wishlist).toHaveLength(1);
      expect(response.body.data.count).toBe(1);
      expect(response.body.data.wishlist[0].name).toBe("Zephyr");
      expect(response.body.message).toBe(
        "Alien added to wishlist successfully"
      );
    });

    it("should not add duplicate alien to wishlist", async () => {
      // Add alien first time
      await request(app)
        .post("/api/wishlist/add")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ alienId: testAlien1._id });

      // Try to add same alien again
      const response = await request(app)
        .post("/api/wishlist/add")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ alienId: testAlien1._id });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("ALREADY_IN_WISHLIST");
    });

    it("should return error for non-existent alien", async () => {
      const fakeAlienId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post("/api/wishlist/add")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ alienId: fakeAlienId });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("ALIEN_NOT_FOUND");
    });

    it("should validate alien ID format", async () => {
      const response = await request(app)
        .post("/api/wishlist/add")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ alienId: "invalid-id" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should require alien ID", async () => {
      const response = await request(app)
        .post("/api/wishlist/add")
        .set("Authorization", `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should require authentication", async () => {
      const response = await request(app)
        .post("/api/wishlist/add")
        .send({ alienId: testAlien1._id });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("NO_TOKEN");
    });
  });

  describe("DELETE /api/wishlist/remove/:alienId", () => {
    beforeEach(async () => {
      // Add alien to wishlist
      testUser.wishlist = [testAlien1._id, testAlien2._id];
      await testUser.save();
    });

    it("should remove alien from wishlist", async () => {
      const response = await request(app)
        .delete(`/api/wishlist/remove/${testAlien1._id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.wishlist).toHaveLength(1);
      expect(response.body.data.count).toBe(1);
      expect(response.body.data.wishlist[0].name).toBe("Vortex");
      expect(response.body.message).toBe(
        "Alien removed from wishlist successfully"
      );
    });

    it("should return error for alien not in wishlist", async () => {
      // Create another alien not in wishlist
      const anotherAlien = new Alien({
        name: "Nova",
        faction: "Cosmic Empire",
        planet: "Gliese 667Cc",
        rarity: "Common",
        price: 50,
        image: "https://example.com/uploads/nova.jpg",
        backstory: "A peaceful alien trader.",
        abilities: ["Trade Negotiation"],
        clothingStyle: "Merchant Robes",
        inStock: true,
      });
      await anotherAlien.save();

      const response = await request(app)
        .delete(`/api/wishlist/remove/${anotherAlien._id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("NOT_IN_WISHLIST");
    });

    it("should return error for non-existent alien", async () => {
      const fakeAlienId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/wishlist/remove/${fakeAlienId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("ALIEN_NOT_FOUND");
    });

    it("should validate alien ID format", async () => {
      const response = await request(app)
        .delete("/api/wishlist/remove/invalid-id")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should require authentication", async () => {
      const response = await request(app).delete(
        `/api/wishlist/remove/${testAlien1._id}`
      );

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("NO_TOKEN");
    });
  });

  describe("GET /api/wishlist/check/:alienId", () => {
    beforeEach(async () => {
      // Add one alien to wishlist
      testUser.wishlist = [testAlien1._id];
      await testUser.save();
    });

    it("should return true for alien in wishlist", async () => {
      const response = await request(app)
        .get(`/api/wishlist/check/${testAlien1._id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isInWishlist).toBe(true);
      expect(response.body.data.alienId).toBe(testAlien1._id.toString());
    });

    it("should return false for alien not in wishlist", async () => {
      const response = await request(app)
        .get(`/api/wishlist/check/${testAlien2._id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isInWishlist).toBe(false);
      expect(response.body.data.alienId).toBe(testAlien2._id.toString());
    });

    it("should return error for non-existent alien", async () => {
      const fakeAlienId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/wishlist/check/${fakeAlienId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("ALIEN_NOT_FOUND");
    });

    it("should validate alien ID format", async () => {
      const response = await request(app)
        .get("/api/wishlist/check/invalid-id")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should require authentication", async () => {
      const response = await request(app).get(
        `/api/wishlist/check/${testAlien1._id}`
      );

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("NO_TOKEN");
    });
  });

  describe("DELETE /api/wishlist/clear", () => {
    beforeEach(async () => {
      // Add aliens to wishlist
      testUser.wishlist = [testAlien1._id, testAlien2._id];
      await testUser.save();
    });

    it("should clear entire wishlist", async () => {
      const response = await request(app)
        .delete("/api/wishlist/clear")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.wishlist).toEqual([]);
      expect(response.body.data.count).toBe(0);
      expect(response.body.message).toBe("Wishlist cleared successfully");
    });

    it("should work with empty wishlist", async () => {
      // Clear wishlist first
      testUser.wishlist = [];
      await testUser.save();

      const response = await request(app)
        .delete("/api/wishlist/clear")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.wishlist).toEqual([]);
      expect(response.body.data.count).toBe(0);
    });

    it("should require authentication", async () => {
      const response = await request(app).delete("/api/wishlist/clear");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("NO_TOKEN");
    });
  });
});
