import mongoose from "mongoose";
import dotenv from "dotenv";
import Alien from "../models/Alien.js";

// Load environment variables
dotenv.config();

const testAlienQuery = async () => {
  try {
    // Connect to MongoDB using the same connection as the server
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/black_market";
    console.log("Using MongoDB URI:", mongoURI);

    const conn = await mongoose.connect(mongoURI);
    console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);

    // Test the exact same query as the controller
    const query = {};
    const sortOptions = { createdAt: -1 };
    const limitNum = 12;
    const skip = 0;

    console.log("🔍 Testing query:", JSON.stringify(query));
    console.log("🔍 Sort options:", sortOptions);

    // Execute the same query as the controller
    const [aliens, totalCount] = await Promise.all([
      Alien.find(query).sort(sortOptions).skip(skip).limit(limitNum).lean(),
      Alien.countDocuments(query),
    ]);

    console.log("👽 Found aliens:", aliens.length);
    console.log("📊 Total count:", totalCount);

    if (aliens.length > 0) {
      console.log("\n📋 First few aliens:");
      aliens.slice(0, 3).forEach((alien) => {
        console.log(
          `  - ${alien.name} (${alien.faction}) - $${alien.price} - inStock: ${alien.inStock}`
        );
      });
    } else {
      console.log("❌ No aliens found with controller query");

      // Try a simple find all
      const allAliens = await Alien.find({});
      console.log(`📊 Total aliens with simple query: ${allAliens.length}`);

      if (allAliens.length > 0) {
        console.log("✅ Aliens exist, there might be a query issue");
        console.log("First alien:", allAliens[0]);
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

// Run the script
testAlienQuery();
