import type { NextConfig } from "next";
import type { Configuration } from "webpack";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  // jsonwebtoken (used by /api/auth/login and /api/auth/google) does not
  // bundle correctly under webpack's server build — it throws
  // "Cannot read properties of undefined (reading 'prototype')" while
  // Next collects page data, confirmed by bisecting down to `import jwt
  // from "jsonwebtoken"` alone with no other imports present. Excluding
  // it from bundling lets Node require() it normally at runtime instead.
  // mongoose/mongodb are excluded for the same reason (they pull in
  // optional native/AWS dependencies — aws4, kerberos,
  // mongodb-client-encryption, snappy — that aren't installed and
  // aren't needed here; bundling them makes webpack try to statically
  // resolve those optional requires and warn/fail on them).
  serverExternalPackages: ["jsonwebtoken", "mongoose", "mongodb"],
  webpack: (config: Configuration) => {
    if (config.externals && Array.isArray(config.externals)) {
      config.externals.push({
        "utf-8-validate": "commonjs utf-8-validate",
        bufferutil: "commonjs bufferutil",
      });
    }
    return config;
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    DEV_FRONTEND_URL: process.env.DEV_FRONTEND_URL,
    PROD_FRONTEND_URL: process.env.PROD_FRONTEND_URL,
  },
};

export default nextConfig;
