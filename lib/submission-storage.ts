import { Storage } from "@google-cloud/storage";
import { get, list, put } from "@vercel/blob";
import { randomUUID } from "node:crypto";

type SubmissionStorageConfig =
  | {
      provider: "gcs";
      bucketName: string;
    }
  | {
      provider: "vercel-blob";
      token: string;
    };

export type StoredSubmission<T> = {
  pathname: string;
  value: T;
};

let storageClient: Storage | undefined;

export function resolveSubmissionStorageConfig(
  env: NodeJS.ProcessEnv = process.env,
): SubmissionStorageConfig {
  const provider = env.SUBMISSION_STORAGE_PROVIDER?.trim() || "vercel-blob";

  if (provider === "gcs") {
    const bucketName = env.SUBMISSION_GCS_BUCKET?.trim();
    if (!bucketName) {
      throw new Error(
        "SUBMISSION_GCS_BUCKET is required when SUBMISSION_STORAGE_PROVIDER=gcs.",
      );
    }
    return { provider, bucketName };
  }

  if (provider === "vercel-blob") {
    const token = env.BLOB_READ_WRITE_TOKEN?.trim();
    if (!token) {
      throw new Error(
        "BLOB_READ_WRITE_TOKEN is required when SUBMISSION_STORAGE_PROVIDER=vercel-blob.",
      );
    }
    return { provider, token };
  }

  throw new Error(`Unsupported SUBMISSION_STORAGE_PROVIDER: ${provider}.`);
}

export function createSubmissionObjectName(
  prefix: string,
  submittedAt: string,
  id = randomUUID(),
) {
  if (!/^[a-z0-9-]+$/.test(prefix)) {
    throw new Error("Submission storage prefix is invalid.");
  }

  return `${prefix}/${submittedAt.replaceAll(":", "-")}-${id}.json`;
}

export async function storeSubmissionJson<T>(
  prefix: string,
  submittedAt: string,
  value: T,
) {
  const pathname = createSubmissionObjectName(prefix, submittedAt);
  const serialized = JSON.stringify(value, null, 2);
  const config = resolveSubmissionStorageConfig();

  if (config.provider === "gcs") {
    await getStorageClient()
      .bucket(config.bucketName)
      .file(pathname)
      .save(serialized, {
        contentType: "application/json",
        metadata: { cacheControl: "no-store" },
        resumable: false,
      });
    return pathname;
  }

  await put(pathname, serialized, {
    access: "private",
    contentType: "application/json",
    token: config.token,
  });
  return pathname;
}

export async function listSubmissionJson<T>(
  prefix: string,
  limit = 50,
): Promise<Array<StoredSubmission<T>>> {
  const config = resolveSubmissionStorageConfig();
  const normalizedPrefix = `${prefix}/`;

  if (config.provider === "gcs") {
    const bucket = getStorageClient().bucket(config.bucketName);
    const [files] = await bucket.getFiles({
      autoPaginate: false,
      maxResults: Math.max(limit, 100),
      prefix: normalizedPrefix,
    });

    const selectedFiles = files
      .filter((file) => file.name.endsWith(".json"))
      .sort((left, right) => right.name.localeCompare(left.name))
      .slice(0, limit);

    return Promise.all(
      selectedFiles.map(async (file) => {
        const [contents] = await file.download();
        return {
          pathname: file.name,
          value: JSON.parse(contents.toString("utf8")) as T,
        };
      }),
    );
  }

  const response = await list({
    limit: Math.max(limit, 100),
    prefix: normalizedPrefix,
    token: config.token,
  });
  const selectedBlobs = [...response.blobs]
    .sort((left, right) => right.pathname.localeCompare(left.pathname))
    .slice(0, limit);

  const submissions = await Promise.all(
    selectedBlobs.map(async (blob) => {
      const result = await get(blob.pathname, {
        access: "private",
        token: config.token,
      });

      if (!result || result.statusCode !== 200 || !result.stream) {
        return null;
      }

      const text = await new Response(result.stream).text();
      return {
        pathname: blob.pathname,
        value: JSON.parse(text) as T,
      };
    }),
  );

  return submissions.filter(
    (submission): submission is StoredSubmission<T> => submission !== null,
  );
}

function getStorageClient() {
  storageClient ??= new Storage();
  return storageClient;
}
