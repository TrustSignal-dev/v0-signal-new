import { describe, expect, it } from "vitest";

import {
  MAX_ARTIFACT_BASE64_LENGTH,
  MAX_ARTIFACT_BYTES,
  encodedBase64Length,
  parseArtifactVerificationResult,
} from "./artifact-verification";

describe("artifact verification browser contract", () => {
  it("keeps raw artifacts inside the API base64-text ceiling", () => {
    expect(MAX_ARTIFACT_BYTES).toBe(15 * 1024 * 1024);
    expect(encodedBase64Length(MAX_ARTIFACT_BYTES)).toBe(
      MAX_ARTIFACT_BASE64_LENGTH,
    );
    expect(encodedBase64Length(MAX_ARTIFACT_BYTES + 1)).toBeGreaterThan(
      MAX_ARTIFACT_BASE64_LENGTH,
    );
  });

  it.each([
    ["MATCH", true, "artifact_digest_match"],
    ["MISMATCH", false, "artifact_digest_mismatch"],
    ["INCONCLUSIVE", false, "receipt_not_verified"],
  ] as const)("accepts a consistent %s result", (status, matched, reasonCode) => {
    expect(parseArtifactVerificationResult({
      status,
      matched,
      reasonCode,
      digestAlgorithm: "sha256",
    })).toEqual({
      status,
      matched,
      reasonCode,
      digestAlgorithm: "sha256",
    });
  });

  it.each([
    null,
    [],
    {},
    { status: "MATCH", matched: true, reasonCode: "artifact_digest_match" },
    { status: "MATCH", matched: false, reasonCode: "artifact_digest_match", digestAlgorithm: "sha256" },
    { status: "MISMATCH", matched: true, reasonCode: "artifact_digest_mismatch", digestAlgorithm: "sha256" },
    { status: "MATCH", matched: true, reasonCode: "artifact_digest_mismatch", digestAlgorithm: "sha256" },
    { status: "UNKNOWN", matched: false, reasonCode: "unrecognized", digestAlgorithm: "sha256" },
    { status: "INCONCLUSIVE", matched: false, reasonCode: "", digestAlgorithm: "sha256" },
    { status: "INCONCLUSIVE", matched: false, reasonCode: "receipt_not_verified", digestAlgorithm: "sha512" },
  ])("rejects malformed or contradictory provider data", (value) => {
    expect(parseArtifactVerificationResult(value)).toBeNull();
  });
});
