import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Alien from "../models/Alien.js";

// Load environment variables
dotenv.config();

const quickSetup = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/black_market"
    );
    console.log("🔗 Connected to MongoDB");

    // Create admin user
    const adminEmail = "admin@example.com";
    const adminPassword = "Admin123456";

    let adminUser = await User.findOne({ email: adminEmail });

    if (!adminUser) {
      adminUser = new User({
        email: adminEmail,
        password: adminPassword,
        firstName: "Admin",
        lastName: "User",
        isAdmin: true,
      });
      await adminUser.save();
      console.log("👑 Created admin user:", adminEmail);
    } else {
      adminUser.isAdmin = true;
      await adminUser.save();
      console.log("👑 Updated admin user:", adminEmail);
    }

    // Create some sample aliens if none exist
    const alienCount = await Alien.countDocuments();

    if (alienCount === 0) {
      const sampleAliens = [
        {
          name: "Zyx the Wanderer",
          faction: "Void Seekers",
          planet: "Nebula Prime",
          rarity: "Common",
          price: 500,
          image: "https://via.placeholder.com/400x300/1a1a2e/16213e?text=Zyx",
          backstory: "A mysterious traveler from the outer rim of the galaxy.",
          abilities: ["Stealth", "Navigation"],
          clothingStyle: "Nomadic Robes",
          featured: false,
          inStock: true,
        },
        {
          name: "Kira Starblade",
          faction: "Solar Warriors",
          planet: "Helios",
          rarity: "Rare",
          price: 1200,
          image: "https://via.placeholder.com/400x300/ff6b6b/ff5252?text=Kira",
          backstory: "Elite warrior from the sun-scorched world of Helios.",
          abilities: ["Solar Energy", "Combat Mastery"],
          clothingStyle: "Battle Armor",
          featured: true,
          inStock: true,
        },
        {
          name: "Echo the Mindweaver",
          faction: "Psychic Collective",
          planet: "Mentara",
          rarity: "Epic",
          price: 2000,
          image: "https://via.placeholder.com/400x300/4ecdc4/26d0ce?text=Echo",
          backstory:
            "Master of telepathic arts from the mind-realm of Mentara.",
          abilities: ["Telepathy", "Mind Control", "Precognition"],
          clothingStyle: "Ethereal Wraps",
          featured: true,
          inStock: true,
        },
      ];

      for (const alienData of sampleAliens) {
        const alien = new Alien(alienData);
        await alien.save();
        console.log(`👽 Created alien: ${alienData.name}`);
      }
    }

    console.log("🎉 Quick setup complete!");
    console.log("");
    console.log("📋 Login Details:");
    console.log("   Email:", adminEmail);
    console.log("   Password:", adminPassword);
    console.log("");
    console.log("🌐 Access your app at:");
    console.log("   Frontend: http://localhost:3000");
    console.log("   Admin Panel: http://localhost:3000/admin");
    console.log("   API: http://localhost:5000");
  } catch (error) {
    console.error("❌ Error during setup:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
};

// Run the script
quickSetup();
