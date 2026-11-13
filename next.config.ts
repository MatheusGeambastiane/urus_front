import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Playwright's development artifacts isolated from a developer's
  // already-running `next dev` process.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  agentRules: false,
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        // Policy belongs to the initial document, including after client-side
        // navigation from login/dashboard to chat. User permission is still required.
        { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=()" },
      ],
    }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "ijj-teste-bucket-novo-ur.s3.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
