"use client";

import { useSyncExternalStore } from "react";

// Mirrors the server-side gate in layout.tsx (which sets
// data-auth-configured on <body>). Null during server render.
export function useAuthConfigured(): boolean | null {
  return useSyncExternalStore(
    () => () => {},
    () => document.body.dataset.authConfigured === "1",
    () => null,
  );
}

export default function NeedKeys() {
  return (
    <main className="mx-auto max-w-md px-6 py-24 text-center">
      <p className="font-medium">Auth isn&apos;t configured yet.</p>
      <p className="mt-2 text-sm text-zinc-500">
        Set <code>NEON_AUTH_BASE_URL</code> and <code>NEON_AUTH_COOKIE_SECRET</code> in{" "}
        <code>.env</code> — both from Neon console → your branch → Auth — then
        restart the dev server.
      </p>
    </main>
  );
}
