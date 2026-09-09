// Ensures a Tectonic binary exists at bin/tectonic for the current platform.
// Safe to re-run; never fails hard (falls back to TECTONIC_BIN / PATH with a
// clear error at compile time).
import { chmodSync, existsSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

const VERSION = "0.15.0";
const DIR = join(process.cwd(), "bin");
const BIN = join(DIR, "tectonic");

const ASSETS = {
  "darwin:arm64": `tectonic-${VERSION}-aarch64-apple-darwin.tar.gz`,
  "darwin:x64": `tectonic-${VERSION}-x86_64-apple-darwin.tar.gz`,
  "linux:x64": `tectonic-${VERSION}-x86_64-unknown-linux-gnu.tar.gz`,
  "linux:arm64": `tectonic-${VERSION}-aarch64-unknown-linux-gnu.tar.gz`,
};

export function fetchTectonic() {
  if (existsSync(BIN)) {
    console.log("fetch-tectonic: bin/tectonic already present, skip");
    return;
  }
  const key = `${process.platform}:${process.arch}`;
  const asset = ASSETS[key];
  if (!asset) {
    console.log(
      `fetch-tectonic: no prebuilt binary for ${key} — install tectonic manually and set TECTONIC_BIN`,
    );
    return;
  }
  const URL =
    `https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.15.0/` +
    asset;
  try {
    mkdirSync(DIR, { recursive: true });
    console.log(`fetch-tectonic: downloading ${asset}`);
    execSync(`curl -sL --max-time 300 -o /tmp/tectonic-dl.tar.gz "${URL}"`, {
      stdio: "inherit",
    });
    execSync(`tar xzf /tmp/tectonic-dl.tar.gz -C "${DIR}" && rm /tmp/tectonic-dl.tar.gz`, {
      stdio: "inherit",
    });
    chmodSync(BIN, 0o755);
    console.log("fetch-tectonic: done");
  } catch (e) {
    console.log(
      `fetch-tectonic: download failed (${e instanceof Error ? e.message : e}) — set TECTONIC_BIN manually`,
    );
  }
}

if (process.argv[1]?.endsWith("fetch-tectonic.mjs")) fetchTectonic();
