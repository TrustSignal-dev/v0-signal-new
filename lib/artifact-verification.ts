// The core API accepts at most 20 MiB of canonical base64 text. Base64 emits
// four characters for every complete three-byte input group, so this is the
// largest raw artifact whose encoded form is guaranteed to fit that contract.
export const MAX_ARTIFACT_BASE64_LENGTH = 20 * 1024 * 1024;
export const MAX_ARTIFACT_BYTES =
  Math.floor(MAX_ARTIFACT_BASE64_LENGTH / 4) * 3;

export function encodedBase64Length(byteLength: number): number {
  if (!Number.isSafeInteger(byteLength) || byteLength < 0) {
    throw new RangeError("byteLength must be a non-negative safe integer");
  }

  return 4 * Math.ceil(byteLength / 3);
}
