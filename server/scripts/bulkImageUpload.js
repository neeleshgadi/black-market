import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to process multiple alien images
const processBulkImages = () => {
  const imagesDir = path.join(__dirname, "../temp-images"); // Put your images here
  const uploadsDir = path.join(__dirname, "../uploads");

  // Create uploads directory if it doesn't exist
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Check if temp-images directory exists
  if (!fs.existsSync(imagesDir)) {
    console.log("Creating temp-images directory...");
    fs.mkdirSync(imagesDir, { recursive: true });
    console.log("📁 Please place your alien images in server/temp-images/");
    console.log("   Then run this script again.");
    return;
  }

  // Read all image files
  const imageFiles = fs
    .readdirSync(imagesDir)
    .filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));

  if (imageFiles.length === 0) {
    console.log("No image files found in temp-images directory");
    return;
  }

  console.log(`Found ${imageFiles.length} image files:`);

  imageFiles.forEach((file, index) => {
    const sourcePath = path.join(imagesDir, file);
    const destPath = path.join(uploadsDir, file);

    // Copy file to uploads directory
    fs.copyFileSync(sourcePath, destPath);
    console.log(`✅ Copied: ${file}`);
  });

  console.log("🎉 All images copied to uploads directory!");
  console.log("💡 Now you can reference them in your alien data as:");
  imageFiles.forEach((file) => {
    console.log(`   image: "/uploads/${file}"`);
  });
};

processBulkImages();
