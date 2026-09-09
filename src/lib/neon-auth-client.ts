"use client";

import { createAuthClient } from "@neondatabase/auth/next";

// The Next.js client talks to our /api/auth proxy, so no public secret or
// endpoint needs to be exposed to the browser.
export const neonAuthClient = createAuthClient();
