"use client";

import { useSyncExternalStore } from "react";
import { KeyRound } from "lucide-react";
import { Card } from "./ui";

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
    <main className="mx-auto flex min-h-screen max-w-md items-center justify-center px-6">
      <Card className="p-6 text-center shadow-lg">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
          <KeyRound className="h-5 w-5" />
        </div>
        <h3 className="mt-3 text-sm font-bold text-foreground">Neon Auth Setup Required</h3>
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
          Set <code className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[11px] text-foreground">NEON_AUTH_BASE_URL</code> and{" "}
          <code className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[11px] text-foreground">NEON_AUTH_COOKIE_SECRET</code> in your{" "}
          <code className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[11px] text-foreground">.env</code> file from the Neon console, then restart the server.
        </p>
      </Card>
    </main>
  );
}
