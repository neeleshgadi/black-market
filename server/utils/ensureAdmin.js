import User from "../models/User.js";
import logger from "./logger.js";

export const ensureAdminExists = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@blackmarket.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123456";

    // Check if admin user exists
    let adminUser = await User.findOne({ email: adminEmail });

    if (!adminUser) {
      // Create admin user
      adminUser = new User({
        email: adminEmail,
        password: adminPassword,
        firstName: process.env.ADMIN_FIRST_NAME || "Admin",
        lastName: process.env.ADMIN_LAST_NAME || "User",
        isAdmin: true,
      });

      await adminUser.save();
      logger.info("Admin user created", { email: adminEmail });
      console.log("✅ Admin user created:", adminEmail);
    } else {
      // Ensure user is admin and update password if needed
      let needsUpdate = false;

      if (!adminUser.isAdmin) {
        adminUser.isAdmin = true;
        needsUpdate = true;
      }

      // Always reset password to ensure it's correct
      adminUser.password = adminPassword;
      needsUpdate = true;

      if (needsUpdate) {
        await adminUser.save();
        logger.info("Admin user updated", { email: adminEmail });
        console.log("✅ Admin user updated:", adminEmail);
      } else {
        console.log("✅ Admin user already exists:", adminEmail);
      }
    }

    // Verify the user can be found and password works
    const verifyUser = await User.findOne({ email: adminEmail }).select(
      "+password"
    );
    if (verifyUser) {
      const isPasswordValid = await verifyUser.comparePassword(adminPassword);
      if (isPasswordValid) {
        console.log("✅ Admin user verification successful");
        return true;
      } else {
        console.error("❌ Admin user password verification failed");
        return false;
      }
    } else {
      console.error("❌ Admin user not found after creation/update");
      return false;
    }
  } catch (error) {
    logger.error("Error ensuring admin user exists", { error: error.message });
    console.error("❌ Error ensuring admin user exists:", error.message);
    return false;
  }
};
