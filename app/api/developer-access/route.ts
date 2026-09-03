import { z } from "zod";
import { storeSubmissionJson } from "@/lib/submission-storage";

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

    const payload = result.data;
    const submittedAt = new Date().toISOString();

    await storeSubmissionJson("developer-access-requests", submittedAt, {
      submittedAt,
      ...payload,
    });

    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { error: "Unable to process the request." },
      { status: 500 },
    );
  }
}
