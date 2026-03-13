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
    unoptimized: true,
  },
};

export default withMDX(nextConfig);
