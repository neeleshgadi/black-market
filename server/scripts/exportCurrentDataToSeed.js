import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Alien, User } from "../models/index.js";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/black-market-aliens"
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

const exportData = async () => {
  try {
    await connectDB();

    // Get all aliens
    const aliens = await Alien.find({}).lean();
    console.log(`Found ${aliens.length} aliens in the database`);

    // Get all users (excluding passwords)
    const users = await User.find({}).select("-password").lean();
    console.log(`Found ${users.length} users in the database`);

    // Create the export data structure
    const exportData = {
      aliens,
      users,
    };

    // Write to a new seed file
    const seedFilePath = path.join(__dirname, "../utils/currentSeedData.js");

    // Convert the data to a JavaScript module format
    let fileContent = `// Auto-generated seed data from current database state
// Generated on ${new Date().toISOString()}

const alienSeedData = ${JSON.stringify(aliens, null, 2)};

// Note: User passwords are not included and will need to be set manually
const userSeedData = ${JSON.stringify(users, null, 2)};

export const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding with current data...");
    
    const { Alien, User } = await import("../models/index.js");
    
    // Clear existing aliens
    await Alien.deleteMany({});
    console.log("✅ Cleared existing aliens");
    
    // Create aliens
    const createdAliens = await Alien.insertMany(alienSeedData);
    console.log(\`✅ Created \${createdAliens.length} alien collectibles\`);
    
    // Handle users (optional - uncomment if you want to replace users)
    /*
    // Clear existing users
    await User.deleteMany({});
    console.log("✅ Cleared existing users");
    
    // Create users (note: passwords will need to be set/hashed)
    for (const user of userSeedData) {
      // For admin users, you might want to set a default password
      const newUser = new User({
        ...user,
        password: user.isAdmin ? "admin123456" : "user123456" // Default passwords
      });
      await newUser.save();
    }
    console.log(\`✅ Created \${userSeedData.length} users\`);
    */
    
    console.log("🎉 Database seeding completed successfully!");
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
};

export const clearDatabase = async (includeUsers = false) => {
  try {
    console.log("🧹 Clearing database...");
    
    const { Alien, Order, Cart } = await import("../models/index.js");
    
    await Alien.deleteMany({});
    await Order.deleteMany({});
    await Cart.deleteMany({});
    
    if (includeUsers) {
      const { User } = await import("../models/index.js");
      await User.deleteMany({});
      console.log("✅ Database cleared successfully (including users)");
    } else {
      console.log("✅ Database cleared successfully (users preserved)");
    }
  } catch (error) {
    console.error("❌ Error clearing database:", error);
    throw error;
  }
};

export { alienSeedData, userSeedData };
`;

    fs.writeFileSync(seedFilePath, fileContent);
    console.log(`✅ Seed data exported to ${seedFilePath}`);

    // Also create a JSON backup
    const jsonBackupPath = path.join(__dirname, "../utils/databaseBackup.json");
    fs.writeFileSync(jsonBackupPath, JSON.stringify(exportData, null, 2));
    console.log(`✅ JSON backup created at ${jsonBackupPath}`);

    console.log("🎉 Export completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error exporting data:", error);
    process.exit(1);
  }
};

exportData();
