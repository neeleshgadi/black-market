import mongoose from "mongoose";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import models
import { Alien, User } from "../models/index.js";

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

    // Get all users
    const users = await User.find({}).lean();
    console.log(`Found ${users.length} users in the database`);

    // Prepare data for export
    // Remove MongoDB specific fields and prepare for seed format
    const alienSeedData = aliens.map((alien) => {
      const { _id, __v, createdAt, updatedAt, ...cleanAlien } = alien;
      return cleanAlien;
    });

    // Extract admin and test users if they exist
    let adminUserData = null;
    let testUserData = null;

    for (const user of users) {
      // Skip password hashes - we'll use the original seed passwords
      const { _id, __v, createdAt, updatedAt, password, ...cleanUser } = user;

      if (user.isAdmin && !adminUserData) {
        adminUserData = {
          ...cleanUser,
          password: "Admin123456", // Using original seed password
        };
      } else if (!user.isAdmin && !testUserData) {
        testUserData = {
          ...cleanUser,
          password: "test123456", // Using original seed password
        };
      }
    }

    // Create the updated seed data file content
    const seedFileContent = `import mongoose from "mongoose";
import { Alien, User, Order, Cart } from "../models/index.js";

const alienSeedData = ${JSON.stringify(alienSeedData, null, 2)};

const adminUserData = ${JSON.stringify(adminUserData, null, 2)};

const testUserData = ${JSON.stringify(testUserData, null, 2)};

export const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing aliens only (preserve users)
    await Alien.deleteMany({});
    console.log("✅ Cleared existing aliens");

    // Check if admin user exists, create if not
    let adminUser = await User.findOne({ email: adminUserData.email });
    if (!adminUser) {
      adminUser = new User(adminUserData);
      await adminUser.save();
      console.log("✅ Created admin user");
    } else {
      // Update existing admin user to ensure admin status
      adminUser.isAdmin = true;
      await adminUser.save();
      console.log("✅ Updated existing admin user");
    }

    // Check if test user exists, create if not
    let testUser = await User.findOne({ email: testUserData.email });
    if (!testUser) {
      testUser = new User(testUserData);
      await testUser.save();
      console.log("✅ Created test user");
    } else {
      console.log("✅ Test user already exists");
    }

    // Create aliens
    const aliens = await Alien.insertMany(alienSeedData);
    console.log(\`✅ Created \${aliens.length} alien collectibles\`);

    // Add some aliens to test user's wishlist
    const randomAliens = aliens.slice(0, 3);
    testUser.wishlist = randomAliens.map((alien) => alien._id);
    await testUser.save();
    console.log("✅ Added aliens to test user wishlist");

    console.log("🎉 Database seeding completed successfully!");
    console.log(\`📊 Summary:\`);
    console.log(\`   - \${aliens.length} aliens created\`);
    console.log(\`   - Users preserved/created\`);
    console.log(\`   - Admin login: \${adminUserData.email} / Admin123456\`);
    console.log(\`   - Test login: \${testUserData.email} / test123456\`);

    return {
      aliens,
      users: [adminUser, testUser],
    };
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
};

export const clearDatabase = async (includeUsers = false) => {
  try {
    console.log("🧹 Clearing database...");

    await Alien.deleteMany({});
    await Order.deleteMany({});
    await Cart.deleteMany({});

    if (includeUsers) {
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

export { alienSeedData, adminUserData, testUserData };
`;

    // Write the updated seed data to a new file
    const seedFilePath = path.join(__dirname, "..", "utils", "seedData.js");
    await fs.writeFile(seedFilePath, seedFileContent);

    console.log(`✅ Successfully updated seed data at ${seedFilePath}`);
    console.log(
      `✅ Exported ${alienSeedData.length} aliens and ${
        adminUserData ? 1 : 0 + testUserData ? 1 : 0
      } users`
    );

    // Also create a backup of the data
    const backupDir = path.join(__dirname, "..", "backups");
    try {
      await fs.mkdir(backupDir, { recursive: true });
    } catch (err) {
      // Directory might already exist
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFilePath = path.join(backupDir, `seed-backup-${timestamp}.js`);
    await fs.writeFile(backupFilePath, seedFileContent);

    console.log(`✅ Created backup at ${backupFilePath}`);

    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error exporting data:", error);
    mongoose.disconnect();
    process.exit(1);
  }
};

exportData();
