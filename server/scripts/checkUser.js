import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

// Load environment variables
dotenv.config();

const checkUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/black_market"
    );
    console.log("Connected to MongoDB");

    const adminEmail = "neeleshgadi@gmail.com";

    // Find the user
    const user = await User.findOne({ email: adminEmail }).select("+password");

    if (user) {
      console.log("✅ User found:");
      console.log("📧 Email:", user.email);
      console.log("👤 Name:", user.firstName, user.lastName);
      console.log("👑 Admin:", user.isAdmin);
      console.log("🔑 Password hash:", user.password ? "Present" : "Missing");
      console.log("📅 Created:", user.createdAt);
      console.log("📅 Updated:", user.updatedAt);

      // Test password comparison
      const testPassword = "Neelesh@2003";
      const isValid = await user.comparePassword(testPassword);
      console.log("🔐 Password test:", isValid ? "VALID" : "INVALID");
    } else {
      console.log("❌ User not found");

      // List all users
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
checkUser();
