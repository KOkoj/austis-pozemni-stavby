import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sourceRoot = join(__dirname, "..");
const desktop = join(sourceRoot, "..");

const sites = {
  "austis-as": {
    name: "austis-as",
    description: "Static website for AUSTIS a.s. (holding).",
    entry: "austis.html",
    domain: "https://www.austis.cz",
    files: [
      "austis.html",
      "austis-o-spolecnosti.html",
      "austis-aktuality.html",
      "austis-kariera.html",
      "austis-kontakt.html",
      "austis-poptavka.html",
      "austis.css",
      "austis.js",
      "austis-admin.html",
      "austis-admin.css",
      "austis-admin.js",
    ],
    sitemapPaths: [
      "/",
      "/austis-o-spolecnosti",
      "/austis-aktuality",
      "/austis-kariera",
      "/austis-kontakt",
      "/austis-poptavka",
    ],
    assets: [
      "ausits napis.png",
      "image 4.png",
      "hero bg 3.png",
      "image 3.png",
      "arrow.svg",
      "hero-section-bg.jpg",
      "hero-seibert.mp4",
      "hero 1.png",
      "hero 2.png",
      "hero 3.png",
      "image 7.png",
      "austis-real-hero.png",
      "austis-hq.png",
    ],
  },
  "austis-real": {
    name: "austis-real",
    description: "Static website for AUSTIS Real.",
    entry: "austis-real.html",
    domain: "https://www.austis-real.cz",
    files: [
      "austis-real.html",
      "austis-real-sluzby.html",
      "austis-real-reference.html",
      "austis-real-aktuality.html",
      "austis-real-kariera.html",
      "austis-real-kontakt.html",
      "austis-real-poptavka.html",
      "austis-real.css",
      "austis-real.js",
    ],
    sitemapPaths: [
      "/",
      "/austis-real-sluzby",
      "/austis-real-reference",
      "/austis-real-aktuality",
      "/austis-real-kariera",
      "/austis-real-kontakt",
      "/austis-real-poptavka",
    ],
    assets: [
      "austis-real-hero.png",
      "image 3.png",
      "hero 1.png",
      "hero 2.png",
      "hero 3.png",
      "image 4.png",
      "image 7.png",
      "hero-section-bg.jpg",
      "hero-seibert.mp4",
    ],
  },
  "austis-stavebni": {
    name: "austis-stavebni",
    description: "Static website for AUSTIS Stavební.",
    entry: "austis-stavebni.html",
    domain: "https://www.austis-stavebni.cz",
    files: [
      "austis-stavebni.html",
      "austis-stavebni-koordinator-bozp.html",
      "austis-stavebni-reference.html",
      "austis-stavebni-cinnosti.html",
      "austis-stavebni-kontakt.html",
      "austis-stavebni-poptavka.html",
      "austis-stavebni.css",
      "austis-stavebni.js",
    ],
    sitemapPaths: [
      "/",
      "/austis-stavebni-koordinator-bozp",
      "/austis-stavebni-reference",
      "/austis-stavebni-cinnosti",
      "/austis-stavebni-kontakt",
      "/austis-stavebni-poptavka",
    ],
    assets: [
      "austis-stavebni-hero.png",
      "austis-stavebni-bozp.jpg",
      "austis-stavebni-tds.jpg",
      "austis-stavebni-kontrola.avif",
      "slivenec.jpg",
      "image 3.png",
      "hero bg 3.png",
      "sluzby-pozemni-stavby.png",
      "image 4.png",
      "hero 3.png",
      "sluzby-rekonstrukce.png",
      "image 7.png",
      "hero-section-bg.jpg",
      "hero-seibert.mp4",
      "hero 1.png",
      "hero 2.png",
    ],
  },
};

function buildMjsContent(requiredFiles) {
  const list = requiredFiles.map((f) => `  "${f}",`).join("\n");
  return `import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { extname, join } from "node:path";

const outputDir = "public";
const requiredFiles = [
${list}
];
const staticExtensions = new Set([".svg", ".ico", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"]);

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    throw new Error(\`\${file} is missing\`);
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

console.log(\`Static site built in \${outputDir}/\`);
`;
}

function vercelJsonContent(entry) {
  return JSON.stringify(
    {
      version: 2,
      outputDirectory: "public",
      cleanUrls: true,
      trailingSlash: false,
      rewrites: [{ source: "/", destination: `/${entry}` }],
      headers: [
        {
          source: "/(.*)",
          headers: [
            { key: "X-Content-Type-Options", value: "nosniff" },
            { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
            { key: "X-Frame-Options", value: "DENY" },
          ],
        },
        {
          source: "/assets/(.*)",
          headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
        },
        {
          source: "/(.*).svg",
          headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
        },
      ],
    },
    null,
    2,
  );
}

function packageJsonContent(site) {
  return JSON.stringify(
    {
      name: site.name,
      version: "1.0.0",
      private: true,
      description: site.description,
      scripts: {
        build: "node build.mjs",
        dev: "vercel dev",
      },
      devDependencies: {},
    },
    null,
    2,
  );
}

function robotsTxtContent(domain) {
  return `User-agent: *
Allow: /

Sitemap: ${domain}/sitemap.xml
`;
}

function sitemapXmlContent(domain, paths) {
  const urls = paths
    .map((path) => `  <url>\n    <loc>${domain}${path === "/" ? "/" : path}</loc>\n  </url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function gitignoreContent() {
  return `.vercel
node_modules
public
dist
.DS_Store
Thumbs.db
`;
}

for (const [folderName, site] of Object.entries(sites)) {
  const targetRoot = join(desktop, folderName);
  mkdirSync(targetRoot, { recursive: true });
  mkdirSync(join(targetRoot, "assets"), { recursive: true });

  for (const file of site.files) {
    const src = join(sourceRoot, file);
    if (!existsSync(src)) {
      throw new Error(`Missing source file for ${folderName}: ${file}`);
    }
    cpSync(src, join(targetRoot, file));
  }

  cpSync(join(sourceRoot, "logo.svg"), join(targetRoot, "logo.svg"));

  for (const asset of site.assets) {
    const src = join(sourceRoot, "assets", asset);
    if (!existsSync(src)) {
      throw new Error(`Missing asset for ${folderName}: assets/${asset}`);
    }
    cpSync(src, join(targetRoot, "assets", asset));
  }

  const requiredFiles = [...site.files, "logo.svg", "robots.txt", "sitemap.xml"];
  writeFileSync(join(targetRoot, "build.mjs"), buildMjsContent(requiredFiles));
  writeFileSync(join(targetRoot, "package.json"), packageJsonContent(site));
  writeFileSync(join(targetRoot, "vercel.json"), vercelJsonContent(site.entry));
  writeFileSync(join(targetRoot, ".gitignore"), gitignoreContent());
  writeFileSync(join(targetRoot, "robots.txt"), robotsTxtContent(site.domain));
  writeFileSync(join(targetRoot, "sitemap.xml"), sitemapXmlContent(site.domain, site.sitemapPaths));

  console.log(`Created ${targetRoot}`);
}

console.log("Sibling sites scaffolded.");
