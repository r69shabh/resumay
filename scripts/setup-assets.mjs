// One-time local assets, safe to re-run:
//  1. Tectonic binary for the current platform -> bin/ (see fetch-tectonic)
//  2. pdf.js worker -> public/ (served as-is for the canvas previewer)
// Never fails hard: missing pieces degrade to clear runtime errors.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fetchTectonic } from "./fetch-tectonic.mjs";

fetchTectonic();

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
