import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const monitorDatabases = async () => {
  try {
    console.log("🔍 Monitoring database creation...");

    const baseUri =
      process.env.MONGODB_URI?.split("/").slice(0, -1).join("/") ||
      "mongodb://localhost:27017";
    await mongoose.connect(baseUri);

    console.log("📡 Connected to MongoDB server");
    console.log("🎯 Current configuration:");
    console.log(
      `   - MONGODB_URI: ${
        process.env.MONGODB_URI || "mongodb://localhost:27017/black_market"
      }`
    );
    console.log(`   - Expected database: black_market`);

    const checkDatabases = async () => {
      const admin = mongoose.connection.db.admin();
      const { databases } = await admin.listDatabases();

      const projectDbs = databases.filter(
        (db) =>
          db.name.includes("black") ||
          db.name.includes("market") ||
          db.name.includes("alien")
      );

      console.log(
        `\n📊 Project databases found (${new Date().toLocaleTimeString()}):`
      );
      projectDbs.forEach((db) => {
        const status = db.name === "black_market" ? "✅" : "⚠️";
        console.log(
          `   ${status} ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(
            2
          )} MB)`
        );
      });

      // Check for the problematic database
      const problemDb = projectDbs.find(
        (db) => db.name === "black-market-alien-store"
      );
      if (problemDb) {
        console.log(
          `\n🚨 ALERT: 'black-market-alien-store' database detected!`
        );
        console.log(
          `   Size: ${(problemDb.sizeOnDisk / 1024 / 1024).toFixed(2)} MB`
        );
        console.log(`   This suggests something is still creating it.`);
      }
    };

    // Initial check
    await checkDatabases();

    // Monitor every 10 seconds
    console.log("\n⏰ Monitoring every 10 seconds... (Press Ctrl+C to stop)");
    setInterval(checkDatabases, 10000);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
};

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n👋 Stopping monitor...");
  await mongoose.disconnect();
  process.exit(0);
});

// Run the script
monitorDatabases();
