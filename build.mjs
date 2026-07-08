import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { extname, join } from "node:path";

const outputDir = "public";
const requiredFiles = [
  "index.html",
  "sluzby.html",
  "reference.html",
  "o-spolecnosti.html",
  "kontakt.html",
  "poptavka.html",
  "styles.css",
  "script.js",
  "austis.html",
  "austis.css",
  "austis.js",
  "austis-o-spolecnosti.html",
  "austis-kontakt.html",
  "austis-poptavka.html",
  "austis-aktuality.html",
  "austis-kariera.html",
  "austis-real.html",
  "austis-real.css",
  "austis-real.js",
  "austis-real-sluzby.html",
  "austis-real-reference.html",
  "austis-real-aktuality.html",
  "austis-real-kariera.html",
  "austis-real-kontakt.html",
  "austis-real-poptavka.html",
  "austis-stavebni.html",
  "austis-stavebni.css",
  "austis-stavebni.js",
  "austis-stavebni-koordinator-bozp.html",
  "austis-stavebni-reference.html",
  "austis-stavebni-cinnosti.html",
  "austis-stavebni-kontakt.html",
  "austis-stavebni-poptavka.html",
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
