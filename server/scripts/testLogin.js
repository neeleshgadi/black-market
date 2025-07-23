import mongoose from "mongoose";
import dotenv from "dotenv";
import { login } from "../controllers/authController.js";

// Load environment variables
dotenv.config();

const testLogin = async () => {
  try {
    // Connect to MongoDB
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/black_market"
    );
    console.log("Connected to MongoDB");

    // Wait a moment for connection to be fully established
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock request and response objects
    const req = {
      body: {
        email: "neeleshgadi@gmail.com",
        password: "Neelesh@2003",
      },
    };

    let responseData = null;
    let statusCode = null;

    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => {
            responseData = data;
            console.log(`Status: ${code}`);
            console.log("Response:", JSON.stringify(data, null, 2));
          },
        };
      },
    };

    console.log("Testing login controller directly...");
    await login(req, res);

    if (statusCode === 200) {
      console.log("✅ Login successful!");
    } else {
      console.log("❌ Login failed!");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Stack:", error.stack);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

// Run the script
testLogin();
