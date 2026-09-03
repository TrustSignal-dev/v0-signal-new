import { describe, expect, it } from "vitest";

import { sanitizeNextPath } from "./redirect";

describe("sanitizeNextPath", () => {
  it("keeps ordinary application paths", () => {
    expect(sanitizeNextPath("/dashboard?section=receipts#latest")).toBe(
      "/dashboard?section=receipts#latest",
    );
  });

  it("rejects absolute and protocol-relative destinations", () => {
    expect(sanitizeNextPath("https://attacker.example/steal")).toBe("/dashboard");
    expect(sanitizeNextPath("//attacker.example/steal")).toBe("/dashboard");
  });

  it("rejects backslash and control-character redirect tricks", () => {
    expect(sanitizeNextPath("/\\attacker.example/steal")).toBe("/dashboard");
    expect(sanitizeNextPath("/dashboard\r\nLocation: https://attacker.example")).toBe(
      "/dashboard",
    );
  });

  it("defaults missing or blank destinations to the dashboard", () => {
    expect(sanitizeNextPath(null)).toBe("/dashboard");
    expect(sanitizeNextPath("  ")).toBe("/dashboard");
  });
});
