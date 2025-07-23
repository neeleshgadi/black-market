import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

// Load environment variables
dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/black_market"
    );
    console.log("Connected to MongoDB");

    const adminEmail = "admin@example.com";
    const adminPassword = "Admin123456";

    // Check if admin user already exists
    const existingUser = await User.findOne({ email: adminEmail });

    if (existingUser) {
      // Update existing user to be admin and reset password
      existingUser.isAdmin = true;
      existingUser.password = adminPassword; // This will trigger password hashing
      await existingUser.save();
      console.log(
        `✅ Updated ${adminEmail} to admin status and reset password`
      );
    } else {
      // Create new admin user
      const adminUser = new User({
        email: adminEmail,
        password: adminPassword,
        firstName: "Admin",
        lastName: "User",
        isAdmin: true,
      });

      await adminUser.save();
      console.log(`✅ Created admin user: ${adminEmail}`);
    }

    console.log("🎉 Admin user setup complete!");
    console.log("📧 Email:", adminEmail);
    console.log("🔑 Password:", adminPassword);
    console.log("👑 Admin Status: true");
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

// Run the script
createAdminUser();
