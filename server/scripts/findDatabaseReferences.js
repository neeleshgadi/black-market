import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const findDatabaseReferences = (dir, results = []) => {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and .git directories
      if (!["node_modules", ".git", ".kiro"].includes(file)) {
        findDatabaseReferences(filePath, results);
      }
    } else if (
      file.endsWith(".js") ||
      file.endsWith(".json") ||
      file.endsWith(".env") ||
      file.endsWith(".md")
    ) {
      try {
        const content = fs.readFileSync(filePath, "utf8");

        // Look for various patterns that might reference the old database
        const patterns = [
          /black-market-alien-store/g,
          /mongodb:\/\/.*black-market-alien-store/g,
          /MONGODB_URI.*black-market-alien-store/g,
          /database.*black-market-alien-store/g,
        ];

        patterns.forEach((pattern, index) => {
          const matches = content.match(pattern);
          if (matches) {
            results.push({
              file: filePath,
              pattern: pattern.toString(),
              matches: matches,
              lineNumbers: content
                .split("\n")
                .map((line, i) => (pattern.test(line) ? i + 1 : null))
                .filter((n) => n !== null),
            });
          }
        });
      } catch (error) {
        // Skip files that can't be read
      }
    }
  }

  return results;
};

console.log(
  "🔍 Searching for all references to 'black-market-alien-store'...\n"
);

const projectRoot = path.resolve(__dirname, "../..");
const results = findDatabaseReferences(projectRoot);

if (results.length === 0) {
  console.log("✅ No references to 'black-market-alien-store' found!");
} else {
  console.log(`⚠️  Found ${results.length} references:\n`);

  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.file}`);
    console.log(`   Pattern: ${result.pattern}`);
    console.log(`   Lines: ${result.lineNumbers.join(", ")}`);
    console.log(`   Matches: ${result.matches.join(", ")}`);
    console.log("");
  });
}

console.log("\n💡 Possible sources of database recreation:");
console.log("1. Scripts that hardcode the old database name");
console.log("2. Environment variables in different files");
console.log("3. Test configurations");
console.log("4. Cached connections or processes");
console.log("5. MongoDB Compass or other GUI tools creating connections");
