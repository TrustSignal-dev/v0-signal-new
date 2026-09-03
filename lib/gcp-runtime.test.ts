import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("GCP web runtime", () => {
  it("builds a portable standalone Next.js server", () => {
    const config = readFileSync(join(process.cwd(), "next.config.mjs"), "utf8");
    const dockerfile = readFileSync(join(process.cwd(), "Dockerfile"), "utf8");

    expect(config).toContain('output: "standalone"');
    expect(dockerfile).toContain("FROM node:22.22.0-bookworm-slim");
    expect(dockerfile).toContain("USER nextjs");
    expect(dockerfile).toContain("EXPOSE 8080");
    expect(dockerfile).toContain('CMD ["node", "server.js"]');
  });

  it("does not require an Edge runtime for generated social images", () => {
    const route = readFileSync(
      join(process.cwd(), "app/api/og/route.tsx"),
      "utf8",
    );

    expect(route).toContain('export const runtime = "nodejs"');
    expect(route).not.toContain('runtime = "edge"');
  });
});
