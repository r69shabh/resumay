import { getNeonAuth } from "@/lib/neon-auth";

// Proxies all Managed Better Auth APIs (/sign-in/*, /sign-out, /get-session…).
// Lazy instance: module scope would throw during `next build` without env.
export async function GET(
  req: Request,
  ctx: { params: Promise<{ path: string[] }> },
) {
  return getNeonAuth().handler().GET(req, ctx);
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ path: string[] }> },
) {
  return getNeonAuth().handler().POST(req, ctx);
}
