import { existsSync, readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";

const sites = [
  {
    name: "austis pozemni stavby",
    root: "c:/Users/matbo/Desktop/austis pozemni stavby/public",
    expectedHtml: [
      "index.html",
      "sluzby.html",
      "projekty.html",
      "o-spolecnosti.html",
      "kontakt.html",
      "poptavka.html",
    ],
    forbiddenHtml: ["austis.html", "austis-real.html", "austis-stavebni.html"],
  },
  {
    name: "austis-as",
    root: "c:/Users/matbo/Desktop/austis-as/public",
    expectedHtml: [
      "austis.html",
      "austis-o-spolecnosti.html",
      "austis-kontakt.html",
    ],
    forbiddenHtml: ["index.html", "austis-real.html"],
  },
  {
    name: "austis-real",
    root: "c:/Users/matbo/Desktop/austis-real/public",
    expectedHtml: ["austis-real.html", "austis-real-sluzby.html"],
    forbiddenHtml: ["index.html", "austis.html"],
  },
  {
    name: "austis-stavebni",
    root: "c:/Users/matbo/Desktop/austis-stavebni/public",
    expectedHtml: ["austis-stavebni.html", "austis-stavebni-kontakt.html"],
    forbiddenHtml: ["index.html", "austis-real.html"],
  },
];

function collectAssetRefs(dir) {
  const refs = new Set();
  const assetPattern = /(?:src|href|poster|data-full|data-hero-image|content)=["'](assets\/[^"']+)["']/g;
  const cssPattern = /url\(["']?(assets\/[^"')]+)["']?\)/g;

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) continue;
    const ext = extname(entry.name).toLowerCase();
    if (![".html", ".css", ".js"].includes(ext)) continue;
    const content = readFileSync(full, "utf8");
    for (const pattern of [assetPattern, cssPattern]) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        refs.add(match[1].split(",")[0].trim());
      }
    }
    const dataCycle = content.match(/data-hero-cycle="([^"]+)"/g) || [];
    for (const cycle of dataCycle) {
      const values = cycle.replace(/^data-hero-cycle="/, "").replace(/"$/, "");
      for (const part of values.split(",")) {
        const trimmed = part.trim();
        if (trimmed.startsWith("assets/")) refs.add(trimmed);
      }
    }
  }
  return [...refs];
}

let failed = false;

for (const site of sites) {
  console.log(`\n=== ${site.name} ===`);
  for (const file of site.expectedHtml) {
    const path = join(site.root, file);
    if (!existsSync(path)) {
      console.error(`MISSING expected HTML: ${file}`);
      failed = true;
    }
  }
  for (const file of site.forbiddenHtml) {
    const path = join(site.root, file);
    if (existsSync(path)) {
      console.error(`FORBIDDEN HTML present: ${file}`);
      failed = true;
    }
  }

  const assetRefs = collectAssetRefs(site.root);
  let missingAssets = 0;
  for (const ref of assetRefs) {
    const path = join(site.root, ref);
    if (!existsSync(path)) {
      console.error(`MISSING asset: ${ref}`);
      missingAssets += 1;
      failed = true;
    }
  }
  console.log(`HTML ok, ${assetRefs.length} asset refs, ${missingAssets} missing`);
}

if (failed) {
  process.exit(1);
}

console.log("\nAll four sites verified.");
