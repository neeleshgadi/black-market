import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

// Load environment variables exactly like the server does
dotenv.config();

const testConnection = async () => {
  try {
    // Use the exact same connection string as the server
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/black_market";
    console.log("Using MongoDB URI:", mongoURI);

    const conn = await mongoose.connect(mongoURI);
    console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);

    const adminEmail = "admin@example.com";

    // Find the user with the same query as the login controller
    const user = await User.findOne({ email: adminEmail }).select("+password");

    if (user) {
      console.log("✅ User found in server database:");
      console.log("📧 Email:", user.email);
      console.log("👤 Name:", user.firstName, user.lastName);
      console.log("👑 Admin:", user.isAdmin);
      console.log("🔑 Password hash:", user.password ? "Present" : "Missing");

      // Test password comparison exactly like the controller does
      const testPassword = "Admin123456";
      const isValid = await user.comparePassword(testPassword);
      console.log("🔐 Password test:", isValid ? "VALID" : "INVALID");

      if (isValid) {
        console.log("🎉 Login should work - user and password are valid!");
      } else {
        console.log("❌ Password comparison failed");
      }
    } else {
      console.log("❌ User not found in server database");

      // List all users to see what's in the database
      const allUsers = await User.find({});
      console.log(`📊 Total users in database: ${allUsers.length}`);
      allUsers.forEach((u) => {
        console.log(`  - ${u.email} (Admin: ${u.isAdmin})`);
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
testConnection();
