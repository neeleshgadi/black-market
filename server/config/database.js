import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Use environment variable for MongoDB URI
    const mongoURI = process.env.MONGODB_URI; // <--- REMOVED THE FALLBACK

    // Add a check to ensure the URI is actually set
    if (!mongoURI) {
      const errorMessage =
        "❌ MONGODB_URI environment variable is not set! Cannot connect to MongoDB.";
      console.error(errorMessage);
      throw new Error(errorMessage); // Throw an error to stop execution
    }

    // You can remove useNewUrlParser and useUnifiedTopology for newer Mongoose versions if they are still there
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000, // Keep trying to connect for 30 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });

    console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed through app termination");
      process.exit(0);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

export default connectDB;
