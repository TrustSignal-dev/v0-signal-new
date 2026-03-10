import nodemailer from "nodemailer";
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

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || "587");
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const toAddress = process.env.PILOT_REQUEST_TO || "info@trustsignal.dev";
    const fromAddress =
      process.env.PILOT_REQUEST_FROM || "TrustSignal <no-reply@trustsignal.dev>";

    if (!smtpHost || !smtpUser || !smtpPass) {
      return Response.json(
        { error: "Email transport is not configured." },
        { status: 503 },
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const { name, company, address, email, phone } = result.data;

    await transporter.sendMail({
      to: toAddress,
      from: fromAddress,
      replyTo: email,
      subject: `TrustSignal pilot request from ${company}`,
      text: [
        "New TrustSignal pilot request",
        "",
        `Name: ${name}`,
        `Company: ${company}`,
        `Address: ${address}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
      ].join("\n"),
      html: `
        <h1>New TrustSignal pilot request</h1>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Company:</strong> ${escapeHtml(company)}</p>
        <p><strong>Address:</strong> ${escapeHtml(address)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
      `,
    });

    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { error: "Unable to process the request." },
      { status: 500 },
    );
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
