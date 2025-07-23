import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backupUploads = async () => {
  try {
    const uploadsDir = path.join(__dirname, "..", "uploads");
    const backupDir = path.join(__dirname, "..", "backups", "uploads");

    // Create backup directory if it doesn't exist
    await fs.mkdir(backupDir, { recursive: true });

    // Read all files in uploads directory
    const files = await fs.readdir(uploadsDir);

    console.log(`Found ${files.length} files in uploads directory`);

    // Copy each file to backup directory
    for (const file of files) {
      if (file === ".gitkeep") continue; // Skip .gitkeep file

      const sourcePath = path.join(uploadsDir, file);
      const destPath = path.join(backupDir, file);

      // Check if it's a file
      const stats = await fs.stat(sourcePath);
      if (stats.isFile()) {
        await fs.copyFile(sourcePath, destPath);
        console.log(`✅ Copied ${file}`);
      }
    }

    console.log(
      `✅ Successfully backed up ${files.length - 1} files to ${backupDir}`
    );
    console.log(
      "You can now zip this directory and upload it to your production server"
    );
  } catch (error) {
    console.error("❌ Error backing up uploads:", error);
    process.exit(1);
  }
};

backupUploads();
