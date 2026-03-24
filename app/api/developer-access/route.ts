import { put } from "@vercel/blob";
import { z } from "zod";

const developerAccessSchema = z
  .object({
    accessMethod: z.enum(["github", "email"]),
    artifactVolumeBand: z.enum(["1-100", "101-500", "500+"]),
    fullName: z.string().trim().min(2),
    company: z.string().trim().min(2),
    role: z.string().trim().min(2),
    email: z.string().trim().email(),
    phone: z.string().trim().optional(),
    githubUsername: z.string().trim().optional(),
    githubProfileUrl: z.string().trim().optional(),
    useCase: z.string().trim().min(12),
  })
  .superRefine((value, ctx) => {
    if (value.accessMethod === "github" && !value.githubUsername?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["githubUsername"],
        message: "GitHub username is required for GitHub access requests.",
      });
    }
  });

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = developerAccessSchema.safeParse(body);

    if (!result.success) {
      return Response.json(
        { error: "Invalid request payload." },
        { status: 400 },
      );
    }

    const blobReadWriteToken = process.env.BLOB_READ_WRITE_TOKEN;

    if (!blobReadWriteToken) {
      return Response.json(
        { error: "Blob storage is not configured." },
        { status: 503 },
      );
    }

    const payload = result.data;
    const submittedAt = new Date().toISOString();
    const slug = `${submittedAt.replaceAll(":", "-")}-${slugify(payload.company)}-${slugify(payload.fullName)}`;

    await put(
      `developer-access-requests/${slug}.json`,
      JSON.stringify(
        {
          submittedAt,
          ...payload,
        },
        null,
        2,
      ),
      {
        access: "private",
        token: blobReadWriteToken,
        contentType: "application/json",
      },
    );

    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { error: "Unable to process the request." },
      { status: 500 },
    );
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}
