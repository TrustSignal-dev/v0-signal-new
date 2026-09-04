// The core API accepts at most 20 MiB of canonical base64 text. Base64 emits
// four characters for every complete three-byte input group, so this is the
// largest raw artifact whose encoded form is guaranteed to fit that contract.
export const MAX_ARTIFACT_BASE64_LENGTH = 20 * 1024 * 1024;
export const MAX_ARTIFACT_BYTES =
  Math.floor(MAX_ARTIFACT_BASE64_LENGTH / 4) * 3;

export type ArtifactVerificationResult = {
  status: "MATCH" | "MISMATCH" | "INCONCLUSIVE";
  matched: boolean;
  reasonCode:
    | "artifact_digest_match"
    | "artifact_digest_mismatch"
    | "signed_document_digest_unavailable"
    | "receipt_not_verified";
  digestAlgorithm: "sha256";
};

const REASON_CODES_BY_STATUS: Readonly<
  Record<ArtifactVerificationResult["status"], ReadonlySet<string>>
> = {
  MATCH: new Set(["artifact_digest_match"]),
  MISMATCH: new Set(["artifact_digest_mismatch"]),
  INCONCLUSIVE: new Set([
    "signed_document_digest_unavailable",
    "receipt_not_verified",
  ]),
};

export function encodedBase64Length(byteLength: number): number {
  if (!Number.isSafeInteger(byteLength) || byteLength < 0) {
    throw new RangeError("byteLength must be a non-negative safe integer");
  }

  return 4 * Math.ceil(byteLength / 3);
}

export function parseArtifactVerificationResult(
  value: unknown,
): ArtifactVerificationResult | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  if (
    (candidate.status !== "MATCH"
      && candidate.status !== "MISMATCH"
      && candidate.status !== "INCONCLUSIVE")
    || typeof candidate.matched !== "boolean"
    || typeof candidate.reasonCode !== "string"
    || candidate.digestAlgorithm !== "sha256"
  ) {
    return null;
  }

  if (
    (candidate.status === "MATCH") !== candidate.matched
    || !REASON_CODES_BY_STATUS[candidate.status].has(candidate.reasonCode)
  ) {
    return null;
  }

  return {
    status: candidate.status,
    matched: candidate.matched,
    reasonCode: candidate.reasonCode as ArtifactVerificationResult["reasonCode"],
    digestAlgorithm: candidate.digestAlgorithm,
  };
}
