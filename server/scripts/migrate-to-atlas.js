import mongoose from "mongoose";
import dotenv from "dotenv";
import { Alien, User, Order, Cart } from "../models/index.js";

dotenv.config();

const migrateToAtlas = async () => {
  let localConnection;
  let atlasConnection;

  let aliens = [];
  let users = [];
  let orders = [];
  let carts = [];

  try {
    console.log("🚀 Starting data migration from local to MongoDB Atlas...");

    const localURI = "mongodb://localhost:27017/black_market";
    console.log("📡 Connecting to local MongoDB...");
    localConnection = await mongoose.createConnection(localURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ Connected to local MongoDB.");

    const LocalAlien = localConnection.model(Alien.modelName, Alien.schema);
    const LocalUser = localConnection.model(User.modelName, User.schema);
    const LocalOrder = localConnection.model(Order.modelName, Order.schema);
    const LocalCart = localConnection.model(Cart.modelName, Cart.schema);

    console.log("📤 Exporting data from local database...");
    aliens = await LocalAlien.find({}).lean();
    users = await LocalUser.find({}).lean();
    orders = await LocalOrder.find({}).lean();
    carts = await LocalCart.find({}).lean();

    console.log(`Found ${aliens.length} aliens`);
    console.log(`Found ${users.length} users`);
    console.log(`Found ${orders.length} orders`);
    console.log(`Found ${carts.length} carts`);
  } catch (error) {
    console.error(
      "❌ Error during local database export or connection:",
      error.message
    );
    process.exit(1);
  } finally {
    if (localConnection) {
      await localConnection.close();
      console.log("👋 Disconnected from local MongoDB.");
    }
  }

  try {
    console.log("🌐 Connecting to MongoDB Atlas...");
    const atlasURI = process.env.MONGODB_URI; // Make sure this matches your .env (MONGO_URI or MONGODB_URI)
    if (!atlasURI || !atlasURI.includes("mongodb+srv://")) {
      throw new Error(
        "Please set your MongoDB Atlas URI in MONGO_URI environment variable (e.g., in your .env file)"
      );
    }

    atlasConnection = await mongoose.createConnection(atlasURI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ Connected to MongoDB Atlas.");

    const AtlasAlien = atlasConnection.model(Alien.modelName, Alien.schema);
    const AtlasUser = atlasConnection.model(User.modelName, User.schema);
    const AtlasOrder = atlasConnection.model(Order.modelName, Order.schema);
    const AtlasCart = atlasConnection.model(Cart.modelName, Cart.schema);

    console.log(
      "📥 Importing data to Atlas (existing collections will be cleared)..."
    );

    const collectionsToMigrate = [
      { name: "aliens", data: aliens, model: AtlasAlien },
      { name: "users", data: users, model: AtlasUser },
      { name: "orders", data: orders, model: AtlasOrder },
      { name: "carts", data: carts, model: AtlasCart },
    ];

    for (const collectionInfo of collectionsToMigrate) {
      const { name, data, model } = collectionInfo;
      if (data.length > 0) {
        // --- CRITICAL CHANGE HERE: Use deleteMany({}) instead of dropCollection ---
        try {
          // Delete all documents in the collection before importing
          await model.deleteMany({});
          console.log(
            `🗑️ Cleared existing documents in '${name}' collection on Atlas.`
          );
        } catch (clearError) {
          console.warn(
            `⚠️ Warning: Could not clear collection '${name}':`,
            clearError.message
          );
        }

        // Insert new data
        await model.insertMany(data);
        console.log(`✅ Imported ${data.length} ${name} documents to Atlas.`);
      } else {
        console.log(`No data to import for '${name}'.`);
      }
    }

    console.log("🎉 Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration to Atlas failed:", error.message);
    process.exit(1);
  } finally {
    if (atlasConnection) {
      await atlasConnection.close();
      console.log("👋 Disconnected from MongoDB Atlas.");
    }
  }
};

migrateToAtlas();
