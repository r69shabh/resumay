// One-time local assets, safe to re-run:
//  1. Tectonic binary for the current platform -> bin/ (see fetch-tectonic)
//  2. pdf.js worker -> public/ (served as-is for the canvas previewer)
//  3. Tectonic cache tarball -> bin/ (for serverless lambda deployment)
// Never fails hard: missing pieces degrade to clear runtime errors.
import { copyFileSync, cpSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fetchTectonic } from "./fetch-tectonic.mjs";

fetchTectonic();

// 1. Ensure tectonic cache is present in bin/cache/
const ASSET_CACHE = join(process.cwd(), "assets", "cache", "Tectonic");
const BIN_CACHE = join(process.cwd(), "bin", "cache", "Tectonic");
try {
  if (existsSync(ASSET_CACHE) && !existsSync(BIN_CACHE)) {
    mkdirSync(join(process.cwd(), "bin", "cache"), { recursive: true });
    cpSync(ASSET_CACHE, BIN_CACHE, { recursive: true });
    console.log("setup-assets: copied tectonic cache to bin/cache/Tectonic");
  }
} catch (e) {
  console.log(`setup-assets: cache copy failed: ${e instanceof Error ? e.message : e}`);
}

// 2. Ensure pdf worker is present in public/
const SRC = join(process.cwd(), "node_modules", "pdfjs-dist", "build", "pdf.worker.min.mjs");
const DEST = join(process.cwd(), "public", "pdf.worker.mjs");
try {
  if (!existsSync(SRC)) {
    console.log("setup-assets: pdfjs-dist not installed yet, skip worker copy");
  } else if (existsSync(DEST)) {
    console.log("setup-assets: pdf.worker.mjs already present, skip");
  } else {
    mkdirSync(join(process.cwd(), "public"), { recursive: true });
    copyFileSync(SRC, DEST);
    console.log("setup-assets: copied pdf worker");
  }
} catch (e) {
  console.log(`setup-assets: worker copy failed (${e instanceof Error ? e.message : e})`);
}
