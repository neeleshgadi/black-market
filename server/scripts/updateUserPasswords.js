import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs"; // Make sure you have bcryptjs installed: npm install bcryptjs
import User from "../models/User.js"; // Adjust path if your models are structured differently

// Load environment variables from .env file.
// This assumes your .env file is in the 'server' directory,
// and you're running the script from the 'server' directory.
dotenv.config();

const updateUserPasswords = async () => {
  let atlasConnection; // Declare connection variable to ensure it's in scope for finally block

  try {
    console.log("🌐 Connecting to MongoDB Atlas...");

    // Ensure you use the correct environment variable name from your .env file
    // It should be MONGO_URI, but if you consistently used MONGODB_URI in .env, change this line
    const atlasURI = process.env.MONGODB_URI;

    if (!atlasURI || !atlasURI.includes("mongodb+srv://")) {
      throw new Error(
        "❌ MongoDB Atlas URI is not properly set in MONGO_URI environment variable."
      );
    }

    atlasConnection = await mongoose.createConnection(atlasURI, {
      // useNewUrlParser and useUnifiedTopology are deprecated in newer Mongoose, can remove
      serverSelectionTimeoutMS: 30000, // Keep trying to connect for 30 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    console.log("✅ Connected to MongoDB Atlas.");

    // Get the User model associated with this specific connection.
    // This uses the schema from your main User.js model.
    const AtlasUser = atlasConnection.model(User.modelName, User.schema);

    console.log("🔄 Starting user password update process...");

    // =========================================================================
    // !! IMPORTANT: REPLACE THESE WITH YOUR ACTUAL USER EMAILS AND PLAIN-TEXT PASSWORDS !!
    // Ensure these match the users you migrated and their desired passwords.
    // =========================================================================
    const usersToUpdate = [
      { email: "admin@example.com", plainTextPassword: "Admin123456" },
      { email: "neeleshgadi@gmail.com", plainTextPassword: "Neelesh@2003" },
      // Add any other users you need to update following this format:
      // { email: "another_user@example.com", plainTextPassword: "TheirPassword" },
      // { email: "yet_another@email.com", plainTextPassword: "SomeOtherPassword" },
    ];
    // =========================================================================

    for (const userData of usersToUpdate) {
      const { email, plainTextPassword } = userData;

      if (!plainTextPassword) {
        console.warn(
          `⚠️ Skipping user ${email}: No plain-text password provided in script.`
        );
        continue;
      }

      try {
        // Find the user by email. We don't need to select('+password') here because we're setting it.
        const user = await AtlasUser.findOne({ email });

        if (user) {
          console.log(`- Found user: ${email}`);

          // Hash the known plain-text password
          const hashedPassword = await bcrypt.hash(plainTextPassword, 12);

          // Update the user document with the new hashed password.
          // The pre('save') hook will NOT run on updateOne, so we manually hash.
          await AtlasUser.updateOne(
            { _id: user._id }, // Find by user ID
            { $set: { password: hashedPassword } } // Set the hashed password
          );
          console.log(`  Password successfully updated for ${email}.`);
        } else {
          console.log(`- User not found in Atlas: ${email}. Skipping.`);
        }
      } catch (userUpdateError) {
        console.error(
          `❌ Error updating password for ${email}:`,
          userUpdateError.message
        );
      }
    }

    console.log("🎉 All specified user passwords have been updated!");
  } catch (error) {
    console.error("❌ Script failed:", error.message);
    process.exit(1); // Exit with an error code
  } finally {
    // Ensure connection is closed whether successful or not
    if (atlasConnection) {
      await atlasConnection.close();
      console.log("👋 Disconnected from MongoDB Atlas.");
    }
  }
};

// Execute the password update function
updateUserPasswords();
