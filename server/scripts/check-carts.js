import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, "..", ".env") });

// Connect to MongoDB
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/black-market";
console.log("Connecting to MongoDB:", MONGODB_URI);

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB");

    // Get all carts
    const carts = await mongoose.connection.db
      .collection("carts")
      .find({})
      .toArray();
    console.log("Carts in database:", carts.length);
    console.log(JSON.stringify(carts, null, 2));

    // Close connection
    await mongoose.connection.close();
    console.log("Connection closed");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });
