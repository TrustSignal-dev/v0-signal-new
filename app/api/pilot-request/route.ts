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

const resendApiKey = process.env.RESEND_API_KEY;
const primaryFrom = "pilot@trustsignal.dev";
const fallbackFrom = "onboarding@resend.dev";

type ResendClient = {
  emails: {
    send(args: {
      from: string;
      to: string[];
      subject: string;
      text: string;
    }): Promise<unknown>;
  };
};

type ResendConstructor = new (apiKey: string) => ResendClient;

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

    const data = {
      submittedAt,
      name,
      company,
      address,
      email,
      phone,
    };

    // Save to Blob storage
    await put(
      `pilot-requests/${slug}.json`,
      JSON.stringify(data, null, 2),
      {
        access: "private",
        token: blobReadWriteToken,
        contentType: "application/json",
      },
    );

    // Send email notification
    if (resendApiKey) {
      try {
        const resend = await createResendClient(resendApiKey);
        const emailText = `New Pilot Request Received:\n\nSubmitted at: ${submittedAt}\nName: ${name}\nCompany: ${company}\nAddress: ${address}\nEmail: ${email}\nPhone: ${phone}`;

        try {
          await resend.emails.send({
            from: primaryFrom,
            to: ["christopher@trustsignal.dev"],
            subject: `TrustSignal Pilot Request: ${company}`,
            text: emailText,
          });
        } catch (error) {
          console.error("Failed to send pilot request email with primary sender.", error);
          await resend.emails.send({
            from: fallbackFrom,
            to: ["christopher@trustsignal.dev"],
            subject: `TrustSignal Pilot Request: ${company} (Fallback)`,
            text: emailText,
          });
        }
      } catch (emailError) {
        console.error("Unable to send pilot request email notification.", emailError);
      }
    } else {
      console.warn("RESEND_API_KEY is not set. Email notification skipped.");
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Unable to process the pilot request.", error);
    return Response.json(
      { error: "Unable to process the request." },
      { status: 500 },
    );
  }
}

async function createResendClient(apiKey: string) {
  const resendModule = (await new Function('return import("resend")')()) as {
    Resend: ResendConstructor;
  };

  return new resendModule.Resend(apiKey);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}
