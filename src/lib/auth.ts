import { getNeonAuth } from "@/lib/neon-auth";

// Neon Auth (managed Better Auth) user id, or null when signed out /
// misconfigured. Null locks everything down: API routes 401, UI shows sign-in.
export async function requireUserId(): Promise<string | null> {
  try {
    const { data } = await getNeonAuth().getSession();
    return data?.user?.id ?? null;
  } catch {
    return null;
  }
}
