import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { extname, join } from "node:path";

const outputDir = "public";
const requiredFiles = [
  "index.html",
  "sluzby.html",
  "reference.html",
  "o-spolecnosti.html",
  "kontakt.html",
  "styles.css",
  "script.js",
];
const staticExtensions = new Set([".svg", ".ico", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"]);

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    throw new Error(`${file} is missing`);
  }
}

rmSync(outputDir, { force: true, recursive: true });
mkdirSync(outputDir, { recursive: true });

for (const file of requiredFiles) {
  cpSync(file, join(outputDir, file));
}

for (const entry of readdirSync(".", { withFileTypes: true })) {
  if (entry.isFile() && staticExtensions.has(extname(entry.name).toLowerCase())) {
    cpSync(entry.name, join(outputDir, entry.name));
  }
}

if (existsSync("assets")) {
  cpSync("assets", join(outputDir, "assets"), { recursive: true });
}

console.log(`Static site built in ${outputDir}/`);
