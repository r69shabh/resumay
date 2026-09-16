"use client";

import { useSyncExternalStore } from "react";
import { KeyRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function useAuthConfigured(): boolean | null {
  return useSyncExternalStore(
    () => () => {},
    () => document.body.dataset.authConfigured === "1",
    () => null,
  );
}

export default function NeedKeys() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <KeyRound className="mx-auto h-8 w-8 text-muted-foreground" />
          <CardTitle className="text-base">Neon Auth Setup Required</CardTitle>
          <CardDescription className="text-xs">
            Set{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">NEON_AUTH_BASE_URL</code>{" "}
            and{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">NEON_AUTH_COOKIE_SECRET</code>{" "}
            in your{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">.env</code>{" "}
            file, then restart the server.
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </main>
  );
}
