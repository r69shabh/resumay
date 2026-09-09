import { createNeonAuth } from "@neondatabase/auth/next/server";

export function neonAuthConfigured(): boolean {
  return Boolean(process.env.NEON_AUTH_BASE_URL && process.env.NEON_AUTH_COOKIE_SECRET);
}

type NeonAuth = ReturnType<typeof createNeonAuth>;

let cached: NeonAuth | null = null;

// Construct at request time so a fresh clone without auth configuration still
// renders the setup hint instead of failing during a build or page render.
export function getNeonAuth(): NeonAuth {
  if (!neonAuthConfigured()) throw new Error("Neon Auth is not configured");
  if (!cached) {
    cached = createNeonAuth({
      baseUrl: process.env.NEON_AUTH_BASE_URL!,
      cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET! },
    });
  }
  return cached;
}
