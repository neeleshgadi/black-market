import mongoose from "mongoose";
import dotenv from "dotenv";
import { seedDatabase, clearDatabase } from "../utils/seedData.js";

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/black_market"
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

const runSeed = async () => {
  try {
    await connectDB();

    const command = process.argv[2];

    switch (command) {
      case "clear":
        await clearDatabase(false); // Don't delete users by default
        break;
      case "clear-all":
        await clearDatabase(true); // Delete everything including users
        break;
      case "seed":
        await seedDatabase();
        break;
      case "reset":
        await clearDatabase(false); // Don't delete users by default
        await seedDatabase();
        break;
      case "reset-all":
        await clearDatabase(true); // Delete everything including users
        await seedDatabase();
        break;
      default:
        console.log("Available commands:");
        console.log("  npm run seed:clear     - Clear data (preserve users)");
        console.log(
          "  npm run seed:clear-all - Clear all data including users"
        );
        console.log("  npm run seed:data      - Seed data only");
        console.log(
          "  npm run seed:reset     - Clear and seed data (preserve users)"
        );
        console.log("  npm run seed:reset-all - Clear all and seed data");
        break;
    }

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

runSeed();
