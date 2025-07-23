import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, "..", ".env") });

// Connect to MongoDB
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/black_market";
console.log("Connecting to MongoDB:", MONGODB_URI);

const FIXED_SESSION_ID = "fixed_cart_session_id_123";

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB");

    // Check if the fixed cart exists
    const cart = await mongoose.connection.db
      .collection("carts")
      .findOne({ sessionId: FIXED_SESSION_ID });

    if (cart) {
      console.log("Fixed cart found:");
      console.log(JSON.stringify(cart, null, 2));
    } else {
      console.log("Fixed cart not found");

      // Create the fixed cart
      console.log("Creating fixed cart...");
      const result = await mongoose.connection.db
        .collection("carts")
        .insertOne({
          sessionId: FIXED_SESSION_ID,
          items: [],
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          createdAt: new Date(),
          updatedAt: new Date(),
          __v: 0,
        });

      console.log("Fixed cart created:", result.insertedId);
    }

    // Close connection
    await mongoose.connection.close();
    console.log("Connection closed");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });
