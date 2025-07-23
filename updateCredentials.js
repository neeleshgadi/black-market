const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Define the replacements
const replacements = [
  {
    from: "admin@example.com",
    to: "admin@example.com",
  },
  {
    from: "Admin123456",
    to: "Admin123456",
  },
  {
    from: 'firstName: "Admin"',
    to: 'firstName: "Admin"',
  },
  {
    from: 'lastName: "User"',
    to: 'lastName: "User"',
  },
];

// Get a list of all files in the project
const getAllFiles = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (
      stat.isDirectory() &&
      !filePath.includes("node_modules") &&
      !filePath.includes(".git")
    ) {
      fileList = getAllFiles(filePath, fileList);
    } else if (
      stat.isFile() &&
      !filePath.includes("node_modules") &&
      !filePath.includes(".git") &&
      !filePath.endsWith(".png") &&
      !filePath.endsWith(".jpg") &&
      !filePath.endsWith(".jpeg") &&
      !filePath.endsWith(".gif") &&
      !filePath.endsWith(".svg")
    ) {
      fileList.push(filePath);
    }
  });

  return fileList;
};

// Process each file
const processFile = (filePath) => {
  try {
    // Skip binary files
    if (path.extname(filePath) === ".bin") return;

    let content = fs.readFileSync(filePath, "utf8");
    let modified = false;

    // Apply all replacements
    replacements.forEach(({ from, to }) => {
      if (content.includes(from)) {
        content = content.split(from).join(to);
        modified = true;
        console.log(`Updated ${from} in ${filePath}`);
      }
    });

    // Save the file if modified
    if (modified) {
      fs.writeFileSync(filePath, content, "utf8");
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
};

// Main function
const main = () => {
  console.log("Starting credential update process...");

  // Get all files
  const files = getAllFiles(".");
  console.log(`Found ${files.length} files to check`);

  // Process each file
  files.forEach(processFile);

  console.log("Credential update complete!");
};

main();
