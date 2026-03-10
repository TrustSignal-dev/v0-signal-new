import { put } from "@vercel/blob";
import { z } from "zod";

const pilotRequestSchema = z.object({
  name: z.string().trim().min(2),
  company: z.string().trim().min(2),
  address: z.string().trim().min(5),
  email: z.string().trim().email(),
  phone: z.string().trim().min(7),
});

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = pilotRequestSchema.safeParse(body);

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

    const { name, company, address, email, phone } = result.data;
    const submittedAt = new Date().toISOString();
    const slug = `${submittedAt.replaceAll(":", "-")}-${slugify(company)}-${slugify(name)}`;

    await put(
      `pilot-requests/${slug}.json`,
      JSON.stringify(
        {
          submittedAt,
          name,
          company,
          address,
          email,
          phone,
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
