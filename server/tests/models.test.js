import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Alien, User, Order, Cart } from "../models/index.js";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Alien.deleteMany({});
  await User.deleteMany({});
  await Order.deleteMany({});
  await Cart.deleteMany({});
});

describe("Alien Model", () => {
  test("should create a valid alien", async () => {
    const alienData = {
      name: "Test Alien",
      faction: "Test Faction",
      planet: "Test Planet",
      rarity: "Common",
      price: 29.99,
      image: "https://example.com/test.jpg",
      backstory: "A test alien for testing purposes",
      abilities: ["Test Ability"],
      clothingStyle: "Test Style",
    };

    const alien = new Alien(alienData);
    const savedAlien = await alien.save();

    expect(savedAlien._id).toBeDefined();
    expect(savedAlien.name).toBe(alienData.name);
    expect(savedAlien.faction).toBe(alienData.faction);
    expect(savedAlien.rarity).toBe(alienData.rarity);
    expect(savedAlien.price).toBe(alienData.price);
    expect(savedAlien.featured).toBe(false);
    expect(savedAlien.inStock).toBe(true);
  });

  test("should require mandatory fields", async () => {
    const alien = new Alien({});

    await expect(alien.save()).rejects.toThrow();
  });

  test("should validate rarity enum", async () => {
    const alien = new Alien({
      name: "Test Alien",
      faction: "Test Faction",
      planet: "Test Planet",
      rarity: "Invalid Rarity",
      price: 29.99,
      image: "https://example.com/test.jpg",
    });

    await expect(alien.save()).rejects.toThrow();
  });
});

describe("User Model", () => {
  test("should create a valid user", async () => {
    const userData = {
      email: "test@example.com",
      password: "password123",
      firstName: "Test",
      lastName: "User",
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.password).not.toBe(userData.password); // Should be hashed
    expect(savedUser.isAdmin).toBe(false);
    expect(savedUser.wishlist).toEqual([]);
  });

  test("should hash password before saving", async () => {
    const userData = {
      email: "test@example.com",
      password: "password123",
    };

    const user = new User(userData);
    await user.save();

    expect(user.password).not.toBe(userData.password);
    expect(user.password.length).toBeGreaterThan(50); // Hashed password should be longer
  });

  test("should validate email format", async () => {
    const user = new User({
      email: "invalid-email",
      password: "password123",
    });

    await expect(user.save()).rejects.toThrow();
  });

  test("should compare passwords correctly", async () => {
    const userData = {
      email: "test@example.com",
      password: "password123",
    };

    const user = new User(userData);
    await user.save();

    const isMatch = await user.comparePassword("password123");
    const isNotMatch = await user.comparePassword("wrongpassword");

    expect(isMatch).toBe(true);
    expect(isNotMatch).toBe(false);
  });
});

describe("Cart Model", () => {
  let testAlien;
  let testUser;

  beforeEach(async () => {
    testAlien = await Alien.create({
      name: "Test Alien",
      faction: "Test Faction",
      planet: "Test Planet",
      rarity: "Common",
      price: 29.99,
      image: "https://example.com/test.jpg",
    });

    testUser = await User.create({
      email: "test@example.com",
      password: "password123",
    });
  });

  test("should create a user cart", async () => {
    const cart = new Cart({
      user: testUser._id,
      items: [
        {
          alien: testAlien._id,
          quantity: 2,
        },
      ],
    });

    const savedCart = await cart.save();

    expect(savedCart._id).toBeDefined();
    expect(savedCart.user.toString()).toBe(testUser._id.toString());
    expect(savedCart.items).toHaveLength(1);
    expect(savedCart.items[0].quantity).toBe(2);
  });

  test("should create a guest cart", async () => {
    const cart = new Cart({
      sessionId: "test-session-123",
      items: [
        {
          alien: testAlien._id,
          quantity: 1,
        },
      ],
    });

    const savedCart = await cart.save();

    expect(savedCart._id).toBeDefined();
    expect(savedCart.sessionId).toBe("test-session-123");
    expect(savedCart.user).toBeUndefined();
  });

  test("should calculate total items correctly", async () => {
    const cart = new Cart({
      user: testUser._id,
      items: [
        { alien: testAlien._id, quantity: 2 },
        { alien: testAlien._id, quantity: 3 },
      ],
    });

    expect(cart.totalItems).toBe(5);
  });

  test("should add items to cart", async () => {
    const cart = new Cart({
      user: testUser._id,
      items: [],
    });

    await cart.addItem(testAlien._id, 2);

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(2);
  });
});

describe("Order Model", () => {
  let testAlien;
  let testUser;

  beforeEach(async () => {
    testAlien = await Alien.create({
      name: "Test Alien",
      faction: "Test Faction",
      planet: "Test Planet",
      rarity: "Common",
      price: 29.99,
      image: "https://example.com/test.jpg",
    });

    testUser = await User.create({
      email: "test@example.com",
      password: "password123",
    });
  });

  test("should create a valid order", async () => {
    const orderData = {
      user: testUser._id,
      items: [
        {
          alien: testAlien._id,
          quantity: 2,
          price: 29.99,
        },
      ],
      totalAmount: 59.98,
      shippingAddress: {
        street: "123 Test St",
        city: "Test City",
        state: "Test State",
        zipCode: "12345",
        country: "Test Country",
      },
    };

    const order = new Order(orderData);
    const savedOrder = await order.save();

    expect(savedOrder._id).toBeDefined();
    expect(savedOrder.orderNumber).toBeDefined();
    expect(savedOrder.orderNumber).toMatch(/^BM\d+$/);
    expect(savedOrder.paymentStatus).toBe("pending");
    expect(savedOrder.orderStatus).toBe("processing");
    expect(savedOrder.totalAmount).toBe(59.98);
  });

  test("should validate total amount matches calculated total", async () => {
    const orderData = {
      user: testUser._id,
      items: [
        {
          alien: testAlien._id,
          quantity: 2,
          price: 29.99,
        },
      ],
      totalAmount: 100.0, // Wrong total
      shippingAddress: {
        street: "123 Test St",
        city: "Test City",
        state: "Test State",
        zipCode: "12345",
        country: "Test Country",
      },
    };

    const order = new Order(orderData);
    await expect(order.save()).rejects.toThrow(
      "Total amount does not match calculated total"
    );
  });
});
