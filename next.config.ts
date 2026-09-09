import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ship the downloaded Tectonic binary with the compile routes on serverless.
  outputFileTracingIncludes: {
    "/api/compile": ["./bin/**/*"],
    "/api/resumes/[id]/text": ["./bin/**/*"],
    "/r/[slug]": ["./bin/**/*"],
  },
};

export default nextConfig;
