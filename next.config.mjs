import createMDX from "@next/mdx";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(import.meta.url));
const codeHikeRemarkPlugin = `${rootDir}/lib/codehike-remark.mjs`;
const codeHikeRecmaPlugin = `${rootDir}/lib/codehike-recma.mjs`;
const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [[codeHikeRemarkPlugin, {
      syntaxHighlighting: {
        theme: "github-dark",
      },
    }]],
    recmaPlugins: [codeHikeRecmaPlugin],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.TRUSTSIGNAL_BUILD_TARGET === "container" ? "standalone" : undefined,
  poweredByHeader: false,
  turbopack: {
    root: rootDir,
  },
  images: {
    // The standalone Node runtime uses sharp for image optimization.
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

export default withMDX(nextConfig);
