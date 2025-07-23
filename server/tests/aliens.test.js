import request from "supertest";
import mongoose from "mongoose";
import app from "../server.js";
import Alien from "../models/Alien.js";
import User from "../models/User.js";
import { generateToken } from "../middleware/auth.js";

describe("Alien Management API", () => {
  let adminToken;
  let adminUser;
  let testAlien;

  beforeAll(async () => {
    // Create admin user for testing
    adminUser = new User({
      email: "admin@test.com",
      password: "Password123", // This will be hashed by the pre-save middleware
      firstName: "Admin",
      lastName: "User",
      isAdmin: true,
    });
    await adminUser.save();
    adminToken = generateToken(adminUser._id);
  });

  beforeEach(async () => {
    // Clear aliens collection before each test
    await Alien.deleteMany({});

    // Create a test alien
    testAlien = new Alien({
      name: "Test Alien",
      faction: "Test Faction",
      planet: "Test Planet",
      rarity: "Common",
      price: 100,
      image: "https://example.com/test.jpg",
      backstory: "A test alien for testing purposes",
      abilities: ["Test Ability 1", "Test Ability 2"],
      clothingStyle: "Test Style",
      featured: false,
      inStock: true,
    });
    await testAlien.save();
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({});
    await Alien.deleteMany({});
  });

  describe("GET /api/aliens", () => {
    it("should get all aliens with default pagination", async () => {
      const response = await request(app).get("/api/aliens");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.aliens).toHaveLength(1);
      expect(response.body.data.pagination).toMatchObject({
        currentPage: 1,
        totalPages: 1,
        totalCount: 1,
        hasNextPage: false,
        hasPrevPage: false,
        limit: 12,
      });
    });

    it("should filter aliens by faction", async () => {
      const response = await request(app)
        .get("/api/aliens")
        .query({ faction: "Test Faction" });

      expect(response.status).toBe(200);
      expect(response.body.data.aliens).toHaveLength(1);
      expect(response.body.data.aliens[0].faction).toBe("Test Faction");
    });

    it("should search aliens by name", async () => {
      const response = await request(app)
        .get("/api/aliens")
        .query({ search: "Test" });

      expect(response.status).toBe(200);
      expect(response.body.data.aliens).toHaveLength(1);
      expect(response.body.data.aliens[0].name).toBe("Test Alien");
    });

    it("should filter aliens by price range", async () => {
      const response = await request(app)
        .get("/api/aliens")
        .query({ minPrice: 50, maxPrice: 150 });

      expect(response.status).toBe(200);
      expect(response.body.data.aliens).toHaveLength(1);
    });

    it("should return empty results for non-matching search", async () => {
      const response = await request(app)
        .get("/api/aliens")
        .query({ search: "NonExistent" });

      expect(response.status).toBe(200);
      expect(response.body.data.aliens).toHaveLength(0);
    });
  });

  describe("GET /api/aliens/:id", () => {
    it("should get a single alien by ID", async () => {
      const response = await request(app).get(`/api/aliens/${testAlien._id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe("Test Alien");
    });

    it("should return 404 for non-existent alien", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/api/aliens/${nonExistentId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("ALIEN_NOT_FOUND");
    });

    it("should return 400 for invalid ID format", async () => {
      const response = await request(app).get("/api/aliens/invalid-id");

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("INVALID_ID");
    });
  });

  describe("GET /api/aliens/:id/related", () => {
    beforeEach(async () => {
      // Create related aliens
      const relatedAlien1 = new Alien({
        name: "Related Alien 1",
        faction: "Test Faction", // Same faction
        planet: "Different Planet",
        rarity: "Rare",
        price: 200,
        image: "https://example.com/related1.jpg",
        inStock: true,
      });

      const relatedAlien2 = new Alien({
        name: "Related Alien 2",
        faction: "Different Faction",
        planet: "Test Planet", // Same planet
        rarity: "Epic",
        price: 300,
        image: "https://example.com/related2.jpg",
        inStock: true,
      });

      await Promise.all([relatedAlien1.save(), relatedAlien2.save()]);
    });

    it("should get related aliens by faction or planet", async () => {
      const response = await request(app).get(
        `/api/aliens/${testAlien._id}/related`
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it("should limit related aliens results", async () => {
      const response = await request(app)
        .get(`/api/aliens/${testAlien._id}/related`)
        .query({ limit: 1 });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
    });
  });

  describe("GET /api/aliens/featured", () => {
    beforeEach(async () => {
      // Create featured alien
      const featuredAlien = new Alien({
        name: "Featured Alien",
        faction: "Featured Faction",
        planet: "Featured Planet",
        rarity: "Legendary",
        price: 500,
        image: "https://example.com/featured.jpg",
        featured: true,
        inStock: true,
      });
      await featuredAlien.save();
    });

    it("should get featured aliens", async () => {
      const response = await request(app).get("/api/aliens/featured");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].featured).toBe(true);
    });
  });

  describe("GET /api/aliens/filter-options", () => {
    it("should get filter options", async () => {
      const response = await request(app).get("/api/aliens/filter-options");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("factions");
      expect(response.body.data).toHaveProperty("planets");
      expect(response.body.data).toHaveProperty("rarities");
      expect(response.body.data).toHaveProperty("priceRange");
    });
  });

  describe("POST /api/aliens", () => {
    const validAlienData = {
      name: "New Alien",
      faction: "New Faction",
      planet: "New Planet",
      rarity: "Rare",
      price: 250,
      image: "https://example.com/new.jpg",
      backstory: "A new alien for testing",
      abilities: ["New Ability"],
      clothingStyle: "New Style",
    };

    it("should create a new alien with admin token", async () => {
      const response = await request(app)
        .post("/api/aliens")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validAlienData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe("New Alien");
    });

    it("should reject creation without admin token", async () => {
      const response = await request(app)
        .post("/api/aliens")
        .send(validAlienData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should validate required fields", async () => {
      const invalidData = { name: "Incomplete Alien" };

      const response = await request(app)
        .post("/api/aliens")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("PUT /api/aliens/:id", () => {
    const updateData = {
      name: "Updated Alien",
      price: 150,
    };

    it("should update an alien with admin token", async () => {
      const response = await request(app)
        .put(`/api/aliens/${testAlien._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe("Updated Alien");
      expect(response.body.data.price).toBe(150);
    });

    it("should reject update without admin token", async () => {
      const response = await request(app)
        .put(`/api/aliens/${testAlien._id}`)
        .send(updateData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should return 404 for non-existent alien", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/aliens/${nonExistentId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("DELETE /api/aliens/:id", () => {
    it("should delete an alien with admin token", async () => {
      const response = await request(app)
        .delete(`/api/aliens/${testAlien._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify alien is deleted
      const deletedAlien = await Alien.findById(testAlien._id);
      expect(deletedAlien).toBeNull();
    });

    it("should reject deletion without admin token", async () => {
      const response = await request(app).delete(
        `/api/aliens/${testAlien._id}`
      );

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should return 404 for non-existent alien", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/aliens/${nonExistentId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
