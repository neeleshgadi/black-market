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
  process.env.MONGODB_URI || "mongodb://localhost:27017/black_market";
console.log("Connecting to MongoDB:", MONGODB_URI);

// First, let's get a session ID from an existing cart
mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB");

    // Get all carts
    const carts = await mongoose.connection.db
      .collection("carts")
      .find({})
      .toArray();
    if (carts.length === 0) {
      console.log("No carts found in database");
      return;
    }

    // Get the first cart with a session ID
    const cart = carts.find((c) => c.sessionId);
    if (!cart) {
      console.log("No cart with session ID found");
      return;
    }

    console.log("Found cart with session ID:", cart.sessionId);

    // Get an alien to add to the cart
    const aliens = await mongoose.connection.db
      .collection("aliens")
      .find({})
      .limit(1)
      .toArray();
    if (aliens.length === 0) {
      console.log("No aliens found in database");
      return;
    }

    const alien = aliens[0];
    console.log("Found alien:", alien.name);

    // Add the alien to the cart
    const result = await mongoose.connection.db.collection("carts").updateOne(
      { _id: cart._id },
      {
        $push: {
          items: {
            alien: alien._id,
            quantity: 1,
          },
        },
        $set: {
          updatedAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      }
    );

    console.log("Update result:", result);

    // Get the updated cart
    const updatedCart = await mongoose.connection.db
      .collection("carts")
      .findOne({ _id: cart._id });
    console.log("Updated cart:", JSON.stringify(updatedCart, null, 2));

    // Close connection
    await mongoose.connection.close();
    console.log("Connection closed");
  })
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
