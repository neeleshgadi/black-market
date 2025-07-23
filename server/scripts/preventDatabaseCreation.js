import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const preventDatabaseCreation = async () => {
  try {
    console.log("🛡️  Setting up database creation prevention...");

    // Ensure we're only using the correct database
    const correctUri = "mongodb://localhost:27017/black_market";
    console.log(`✅ Using: ${correctUri}`);

    // Override any environment variables that might be wrong
    process.env.MONGODB_URI = correctUri;

    await mongoose.connect(correctUri);
    console.log("📡 Connected to correct database");

    // Verify we're connected to the right database
    const dbName = mongoose.connection.name;
    console.log(`🎯 Connected to database: ${dbName}`);

    if (dbName !== "black_market") {
      console.error(`❌ ERROR: Connected to wrong database: ${dbName}`);
      console.error(`   Expected: black_market`);
      process.exit(1);
    }

    console.log("✅ Database connection verified");

    // Check for admin user
    const User = (await import("../models/User.js")).default;
    const adminUser = await User.findOne({ email: "neeleshgadi@gmail.com" });

    if (adminUser) {
      console.log("✅ Admin user found in correct database");
    } else {
      console.log("⚠️  Admin user not found, creating...");
      const newAdmin = new User({
        email: "neeleshgadi@gmail.com",
        password: "Neelesh@2003",
        firstName: "Neelesh",
        lastName: "Gadi",
        isAdmin: true,
      });
      await newAdmin.save();
      console.log("✅ Admin user created");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
};

// Run the script
preventDatabaseCreation();
