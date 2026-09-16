import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ship the downloaded Tectonic binary and cache with the compile routes on serverless.
  outputFileTracingIncludes: {
    "/api/compile": ["./bin/**/*", "./assets/**/*"],
    "/api/resumes/[id]/text": ["./bin/**/*", "./assets/**/*"],
    "/api/resumes/[id]/pdf": ["./bin/**/*", "./assets/**/*"],
    "/r/[slug]": ["./bin/**/*", "./assets/**/*"],
    "/r/[slug]/text": ["./bin/**/*", "./assets/**/*"],
  },
};

export default nextConfig;
