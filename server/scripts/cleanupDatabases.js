import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const cleanupDatabases = async () => {
  try {
    console.log("🧹 Starting database cleanup...");

    // List of potential database names that might exist
    const potentialDatabases = [
      "black_market",
      "blackmarket",
      "black_market_test",
    ];

    // Connect to MongoDB without specifying a database
    const baseUri =
      process.env.MONGODB_URI?.split("/").slice(0, -1).join("/") ||
      "mongodb://localhost:27017";
    await mongoose.connect(baseUri);

    console.log("📡 Connected to MongoDB server");

    // Get list of all databases
    const admin = mongoose.connection.db.admin();
    const { databases } = await admin.listDatabases();

    console.log("📊 Found databases:");
    databases.forEach((db) => {
      console.log(
        `  - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`
      );
    });

    // Find our project databases
    const projectDatabases = databases.filter((db) =>
      potentialDatabases.includes(db.name)
    );

    console.log(
      `\n🎯 Found ${projectDatabases.length} project-related databases:`
    );
    projectDatabases.forEach((db) => {
      console.log(`  - ${db.name}`);
    });

    if (projectDatabases.length > 1) {
      console.log("\n⚠️  Multiple project databases detected!");
      console.log(
        "📋 Recommended action: Keep 'black_market' as the primary database"
      );

      // Check which database has the most data
      let primaryDb = null;
      let maxSize = 0;

      for (const db of projectDatabases) {
        if (db.sizeOnDisk > maxSize) {
          maxSize = db.sizeOnDisk;
          primaryDb = db.name;
        }
      }

      console.log(
        `\n📈 Database with most data: ${primaryDb} (${(
          maxSize /
          1024 /
          1024
        ).toFixed(2)} MB)`
      );

      // Connect to the primary database to check collections
      await mongoose.disconnect();
      await mongoose.connect(`${baseUri}/${primaryDb}`);

      const collections = await mongoose.connection.db
        .listCollections()
        .toArray();
      console.log(`\n📚 Collections in ${primaryDb}:`);
      collections.forEach((collection) => {
        console.log(`  - ${collection.name}`);
      });

      // Check for users and aliens
      const usersCount = await mongoose.connection.db
        .collection("users")
        .countDocuments();
      const aliensCount = await mongoose.connection.db
        .collection("aliens")
        .countDocuments();

      console.log(`\n📊 Data summary for ${primaryDb}:`);
      console.log(`  - Users: ${usersCount}`);
      console.log(`  - Aliens: ${aliensCount}`);

      console.log(
        "\n✅ Recommendation: Use 'black_market' as the standard database name"
      );
      console.log(
        "🗑️  You can safely delete other project databases from MongoDB Compass"
      );
    } else if (projectDatabases.length === 1) {
      console.log(
        `\n✅ Only one project database found: ${projectDatabases[0].name}`
      );
      console.log("🎉 No cleanup needed!");
    } else {
      console.log("\n❌ No project databases found");
    }
  } catch (error) {
    console.error("❌ Error during cleanup:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
};

// Run the script
cleanupDatabases();
