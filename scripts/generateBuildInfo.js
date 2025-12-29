// scripts/generate-build-info.js
const fs = require("fs");
const path = require("path");

// Define output TypeScript file path
const outputPath = path.join(__dirname, "..", "src", "buildInfo.ts");

// Prepare data
const buildTimestamp = new Date().toISOString();
const version = require("../package.json").version;

// TypeScript file content
const content =
`// ⚠️ This file is auto-generated. Do not edit manually.
export const BUILD_INFO = {
  timestamp: "${buildTimestamp}",
  version: "${version}"
} as const;
`;

fs.writeFileSync(outputPath, content);
console.log(`✅ Generated buildInfo.ts with build time: ${buildTimestamp}`);