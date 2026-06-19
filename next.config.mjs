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
  turbopack: {
    root: rootDir,
  },
  images: {
    // Enable Vercel's built-in image optimization (WebP/AVIF + resizing) for
    // better LCP / Core Web Vitals. All <Image> sources are local public assets.
    formats: ["image/avif", "image/webp"],
  },
};

export default withMDX(nextConfig);
