import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  createSubmissionObjectName,
  resolveSubmissionStorageConfig,
} from "./submission-storage";

const originalProvider = process.env.SUBMISSION_STORAGE_PROVIDER;
const originalBucket = process.env.SUBMISSION_GCS_BUCKET;
const originalBlobToken = process.env.BLOB_READ_WRITE_TOKEN;

afterEach(() => {
  restoreEnv("SUBMISSION_STORAGE_PROVIDER", originalProvider);
  restoreEnv("SUBMISSION_GCS_BUCKET", originalBucket);
  restoreEnv("BLOB_READ_WRITE_TOKEN", originalBlobToken);
});

describe("submission storage", () => {
  it("selects GCS without requiring a long-lived credential", () => {
    process.env.SUBMISSION_STORAGE_PROVIDER = "gcs";
    process.env.SUBMISSION_GCS_BUCKET = "trustsignal-staging-submissions";
    delete process.env.BLOB_READ_WRITE_TOKEN;

    expect(resolveSubmissionStorageConfig()).toEqual({
      provider: "gcs",
      bucketName: "trustsignal-staging-submissions",
    });
  });

  it("fails closed when GCS is selected without a bucket", () => {
    process.env.SUBMISSION_STORAGE_PROVIDER = "gcs";
    delete process.env.SUBMISSION_GCS_BUCKET;

    expect(() => resolveSubmissionStorageConfig()).toThrow(
      "SUBMISSION_GCS_BUCKET is required",
    );
  });

  it("keeps Vercel Blob as the explicit compatibility provider", () => {
    process.env.SUBMISSION_STORAGE_PROVIDER = "vercel-blob";
    process.env.BLOB_READ_WRITE_TOKEN = "test-token";

    expect(resolveSubmissionStorageConfig()).toEqual({
      provider: "vercel-blob",
      token: "test-token",
    });
  });

  it("rejects unknown providers", () => {
    process.env.SUBMISSION_STORAGE_PROVIDER = "filesystem";

    expect(() => resolveSubmissionStorageConfig()).toThrow(
      "Unsupported SUBMISSION_STORAGE_PROVIDER",
    );
  });

  it("builds sortable object names without customer PII", () => {
    const objectName = createSubmissionObjectName(
      "pilot-requests",
      "2026-09-03T12:34:56.000Z",
      "8f55ce7c-04f4-4e2d-b7ae-43da825f5301",
    );

    expect(objectName).toBe(
      "pilot-requests/2026-09-03T12-34-56.000Z-8f55ce7c-04f4-4e2d-b7ae-43da825f5301.json",
    );
    expect(objectName).not.toContain("company");
    expect(objectName).not.toContain("name");
  });

  it("routes submissions and review reads through the storage boundary", () => {
    const routeFiles = [
      "app/api/developer-access/route.ts",
      "app/api/pilot-request/route.ts",
      "app/review/page.tsx",
    ];

    for (const routeFile of routeFiles) {
      const source = readFileSync(join(process.cwd(), routeFile), "utf8");
      expect(source).not.toContain("@vercel/blob");
      expect(source).toContain("@/lib/submission-storage");
    }
  });
});

function restoreEnv(name: string, value: string | undefined) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}
