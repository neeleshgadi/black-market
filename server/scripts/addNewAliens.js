import mongoose from "mongoose";
import dotenv from "dotenv";
import Alien from "../models/Alien.js";
import { newAliens } from "../data/newAliens.js";

// Load environment variables
dotenv.config();

const addNewAliens = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/black_market"
    );
    console.log("Connected to MongoDB");

    // Add new aliens
    for (const alienData of newAliens) {
      // Check if alien already exists
      const existingAlien = await Alien.findOne({ name: alienData.name });

      if (existingAlien) {
        console.log(`Alien ${alienData.name} already exists, skipping...`);
        continue;
      }

      // Create new alien
      const alien = new Alien(alienData);
      await alien.save();
      console.log(
        `✅ Added ${alienData.name} from ${alienData.faction} faction`
      );
    }

    console.log("🎉 All new aliens added successfully!");
  } catch (error) {
    console.error("Error adding aliens:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

// Run the script
addNewAliens();
