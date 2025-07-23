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

    // Get the fixed cart
    const cart = await mongoose.connection.db
      .collection("carts")
      .findOne({ sessionId: FIXED_SESSION_ID });

    if (!cart) {
      console.log("Fixed cart not found");
      return;
    }

    console.log("Fixed cart found:", cart._id);

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
      { sessionId: FIXED_SESSION_ID },
      {
        $push: {
          items: {
            alien: alien._id,
            quantity: 1,
            _id: new mongoose.Types.ObjectId(),
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
      .findOne({ sessionId: FIXED_SESSION_ID });
    console.log("Updated cart:", JSON.stringify(updatedCart, null, 2));

    // Close connection
    await mongoose.connection.close();
    console.log("Connection closed");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });
