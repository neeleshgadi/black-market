import mongoose from "mongoose";
import dotenv from "dotenv";
import { Alien } from "../models/index.js";

// Load environment variables
dotenv.config();

const checkAliens = async () => {
  try {
    // Connect to MongoDB
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/black_market";
    console.log("Using MongoDB URI:", mongoURI);

    const conn = await mongoose.connect(mongoURI);
    console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);

    // Count aliens
    const alienCount = await Alien.countDocuments();
    console.log(`👽 Total aliens in database: ${alienCount}`);

    if (alienCount > 0) {
      // Get first few aliens
      const aliens = await Alien.find().limit(5);
      console.log("\n📋 Sample aliens:");
      aliens.forEach((alien) => {
        console.log(`  - ${alien.name} (${alien.faction}) - $${alien.price}`);
      });
    } else {
      console.log("❌ No aliens found in database");

      // Check all collections
      const collections = await mongoose.connection.db
        .listCollections()
        .toArray();
      console.log("\n📊 Available collections:");
      collections.forEach((col) => {
        console.log(`  - ${col.name}`);
      });
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

// Run the script
checkAliens();
