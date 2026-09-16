import { execFile } from "node:child_process";
import { accessSync, chmodSync, constants, copyFileSync, cpSync, existsSync, mkdirSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { extractText } from "unpdf";

// Resolution order: explicit env -> bundled bin/ (serverless deploys) -> PATH.
function tectonicBin(): string {
  if (process.env.TECTONIC_BIN) return process.env.TECTONIC_BIN;
  const bundled = join(process.cwd(), "bin", "tectonic");
  if (existsSync(bundled)) {
    try {
      accessSync(bundled, constants.X_OK);
      return bundled;
    } catch {
      // In read-only serverless filesystems without execute permissions, copy to /tmp and chmod +x
      const tmpBin = join(tmpdir(), "tectonic");
      if (!existsSync(tmpBin)) {
        try {
          copyFileSync(bundled, tmpBin);
          chmodSync(tmpBin, 0o755);
        } catch {
          return bundled;
        }
      }
      return tmpBin;
    }
  }
  return "tectonic";
}

let cacheInitialized = false;

function ensureCache(): void {
  if (cacheInitialized) return;

  const isMac = process.platform === "darwin";
  const targetDir = isMac
    ? join(process.env.HOME || tmpdir(), "Library", "Caches", "Tectonic")
    : join(tmpdir(), ".cache", "Tectonic");

  if (existsSync(targetDir)) {
    cacheInitialized = true;
    return;
  }

  // Pure Node.js directory copy — works in minimal Lambda containers without tar
  const candidates = [
    join(process.cwd(), "assets", "cache", "Tectonic"),
    join(process.cwd(), "bin", "cache", "Tectonic"),
  ];
  const sourceCache = candidates.find((p) => existsSync(p));

  if (sourceCache) {
    try {
      const destParent = isMac
        ? join(process.env.HOME || tmpdir(), "Library", "Caches")
        : join(tmpdir(), ".cache");
      mkdirSync(destParent, { recursive: true });
      cpSync(sourceCache, targetDir, { recursive: true });
    } catch (err) {
      console.warn("ensureCache: failed to copy cache directory", err);
    }
  }

  cacheInitialized = true;
}

export class CompileError extends Error {
  log: string;
  constructor(log: string) {
    super("compile failed");
    this.log = log;
  }
}

// Concurrency limiter to prevent CPU exhaustion while allowing parallel compiles
let activeCompiles = 0;
const MAX_CONCURRENT = 2;
const waitQueue: Array<() => void> = [];

function acquireCompileSlot(): Promise<void> {
  if (activeCompiles < MAX_CONCURRENT) {
    activeCompiles++;
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => {
    waitQueue.push(() => {
      activeCompiles++;
      resolve();
    });
  });
}

function releaseCompileSlot(): void {
  activeCompiles--;
  const next = waitQueue.shift();
  if (next) next();
}

// Compile LaTeX to PDF bytes. Throws CompileError (with TeX log) on failure.
export async function compileLatex(source: string): Promise<Buffer> {
  await acquireCompileSlot();
  try {
    return await runCompile(source);
  } finally {
    releaseCompileSlot();
  }
}

async function runCompile(source: string): Promise<Buffer> {
  ensureCache();
  const dir = await mkdtemp(join(tmpdir(), "resume-"));
  try {
    await writeFile(join(dir, "main.tex"), source);
    await new Promise<void>((resolve, reject) => {
      execFile(
        /*turbopackIgnore: true*/
        tectonicBin(),
        ["-X", "compile", "main.tex", "--outdir", dir, "--keep-logs"],
        {
          cwd: dir,
          timeout: 45_000,
          env: {
            ...process.env,
            ...(process.platform === "darwin"
              ? {}
              : {
                  HOME: tmpdir(),
                  XDG_CACHE_HOME: join(tmpdir(), ".cache"),
                  XDG_CONFIG_HOME: join(tmpdir(), ".config"),
                }),
          },
        },
        (err) => (err ? reject(err) : resolve()),
      );
    });
    return await readFile(join(dir, "main.pdf"));
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e);
    const log = await readFile(join(dir, "main.log"), "utf8")
      .then((l) => l.slice(-4000))
      .catch(() => "");
    throw new CompileError(
      log || `Tectonic compilation error: ${reason}`,
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

// Tiny single-instance cache so public share views don't recompile every hit.
// Keyed by slug, invalidated when the resume updates.
const cache = new Map<string, { updatedAt: number; b64: string }>();

export async function getCachedPdf(
  slug: string,
  updatedAt: Date,
  latexSource: string,
): Promise<string | null> {
  const hit = cache.get(slug);
  if (hit && hit.updatedAt === updatedAt.getTime()) return hit.b64;
  try {
    const pdf = await compileLatex(latexSource);
    const b64 = pdf.toString("base64");
    cache.set(slug, { updatedAt: updatedAt.getTime(), b64 });
    return b64;
  } catch {
    return null;
  }
}

// Plain text from PDF bytes (pure JS, serverless-safe). Single extraction
// path shared by the editor ATS view and public share text.
// NOTE: Buffer extends Uint8Array, so `instanceof` can't tell them apart —
// and pdf.js rejects Buffers outright. Always copy into a real Uint8Array.
export async function extractPdfText(pdf: Buffer | Uint8Array): Promise<string> {
  const { text } = await extractText(new Uint8Array(pdf), { mergePages: true });
  return Array.isArray(text) ? text.join("\n") : text;
}
