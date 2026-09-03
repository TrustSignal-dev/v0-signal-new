import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveTrustedAppOrigin } from "./origin";

describe("resolveTrustedAppOrigin", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses the request origin when no public origin is configured", () => {
    vi.stubEnv("TRUSTSIGNAL_APP_ORIGIN", "");

    expect(resolveTrustedAppOrigin("https://preview.example.test/auth/callback")).toBe(
      "https://preview.example.test",
    );
  });

  it("uses the configured public origin behind a reverse proxy", () => {
    vi.stubEnv(
      "TRUSTSIGNAL_APP_ORIGIN",
      "https://trustsignal-web-staging-87868037131.us-east5.run.app/",
    );

    expect(resolveTrustedAppOrigin("https://0.0.0.0:8080/api/auth/oauth")).toBe(
      "https://trustsignal-web-staging-87868037131.us-east5.run.app",
    );
  });

  it.each([
    "https://example.test/path",
    "https://example.test?redirect=attacker",
    "https://example.test#fragment",
    "https://user:password@example.test",
    "http://example.test",
  ])("rejects an unsafe configured origin: %s", (configuredOrigin) => {
    vi.stubEnv("TRUSTSIGNAL_APP_ORIGIN", configuredOrigin);

    expect(() => resolveTrustedAppOrigin("https://preview.example.test/auth/callback")).toThrow();
  });

  it("allows HTTP only for local development", () => {
    vi.stubEnv("TRUSTSIGNAL_APP_ORIGIN", "http://localhost:3000");

    expect(resolveTrustedAppOrigin("http://0.0.0.0:3000/auth/callback")).toBe(
      "http://localhost:3000",
    );
  });
});
