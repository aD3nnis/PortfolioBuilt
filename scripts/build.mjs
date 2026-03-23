import { cp, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");

const EXCLUDE_NAMES = new Set([
  ".git",
  "node_modules",
  "dist",
  ".vscode",
]);

const shouldInclude = (source) => {
  const relative = path.relative(rootDir, source);
  if (!relative || relative.startsWith("..")) return true;
  const topLevelName = relative.split(path.sep)[0];
  if (EXCLUDE_NAMES.has(topLevelName)) return false;
  if (relative === ".DS_Store") return false;
  return true;
};

async function build() {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });

  const topLevelEntries = await readdir(rootDir);
  for (const entry of topLevelEntries) {
    if (EXCLUDE_NAMES.has(entry) || entry === ".DS_Store" || entry.startsWith(".")) continue;
    const sourcePath = path.join(rootDir, entry);
    const destinationPath = path.join(distDir, entry);
    await cp(sourcePath, destinationPath, {
      recursive: true,
      filter: shouldInclude,
    });
  }

  console.log("Build complete.");
  console.log(`Output directory: ${distDir}`);
}

build().catch((error) => {
  console.error("Build failed.");
  console.error(error);
  process.exit(1);
});
