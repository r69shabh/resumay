import { execFile } from "node:child_process";
import { accessSync, chmodSync, constants, copyFileSync, existsSync } from "node:fs";
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

export class CompileError extends Error {
  log: string;
  constructor(log: string) {
    super("compile failed");
    this.log = log;
  }
}

// Serializes compiles in-process: the live preview and ATS view often fire
// together, and concurrent tectonic runs contend on the shared bundle cache.
let compileQueue: Promise<unknown> = Promise.resolve();

// Compile LaTeX to PDF bytes. Throws CompileError (with TeX log) on failure.
export async function compileLatex(source: string): Promise<Buffer> {
  const run = compileQueue.then(() => runCompile(source));
  // Keep the chain alive even if one compile rejects.
  compileQueue = run.catch(() => {});
  return run;
}

async function runCompile(source: string): Promise<Buffer> {
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
          timeout: 180_000,
          env: {
            ...process.env,
            XDG_CACHE_HOME: join(tmpdir(), ".cache"),
            XDG_CONFIG_HOME: join(tmpdir(), ".config"),
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
    // No log at all means tectonic never ran (missing binary, not a TeX error).
    throw new CompileError(
      log || `tectonic failed to run: ${reason} — install it (brew install tectonic) or set TECTONIC_BIN`,
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
