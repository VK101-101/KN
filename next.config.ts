import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sweph"],
  // Ship the Swiss Ephemeris data files with the server bundle on hosts such
  // as Vercel, where only traced files are deployed.
  outputFileTracingIncludes: {
    "/*": ["./ephe/**/*"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
