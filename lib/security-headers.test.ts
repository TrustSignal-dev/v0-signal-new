import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("production security headers", () => {
  it("sets baseline browser hardening headers for every route", () => {
    const config = readFileSync(join(process.cwd(), "next.config.mjs"), "utf8");

    expect(config.includes('poweredByHeader: false')).toBe(true);
    expect(config.includes('Content-Security-Policy')).toBe(true);
    expect(config.includes("frame-ancestors 'none'")).toBe(true);
    expect(config.includes('X-Content-Type-Options')).toBe(true);
    expect(config.includes('X-Frame-Options')).toBe(true);
    expect(config.includes('Referrer-Policy')).toBe(true);
    expect(config.includes('Permissions-Policy')).toBe(true);
  });
});
