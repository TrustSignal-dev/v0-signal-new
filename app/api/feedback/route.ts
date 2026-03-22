export const runtime = "nodejs";

const resendApiKey = process.env.RESEND_API_KEY;
const primaryFrom = "feedback@trustsignal.dev";
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
    const answers = await request.json();

    if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
      return Response.json({ error: "Invalid request payload." }, { status: 400 });
    }

    if (!resendApiKey) {
      console.error("Missing RESEND_API_KEY environment variable.");
      return Response.json({ error: "Unable to send feedback." }, { status: 500 });
    }

    const resend = await createResendClient(resendApiKey);
    const submittedAt = new Date().toISOString();
    const formattedAnswers = Object.entries(answers as Record<string, unknown>)
      .map(([field, value]) => `${field}: ${formatAnswer(value)}`)
      .join("\n");

    try {
      await resend.emails.send({
        from: primaryFrom,
        to: ["info@trustsignal.dev"],
        subject: "TrustSignal feedback form submission",
        text: `Submitted at: ${submittedAt}\n\n${formattedAnswers}`,
      });
    } catch (error) {
      console.error("Failed to send feedback with primary sender.", error);

      await resend.emails.send({
        from: fallbackFrom,
        to: ["info@trustsignal.dev"],
        subject: "TrustSignal feedback form submission",
        text: `Submitted at: ${submittedAt}\n\n${formattedAnswers}`,
      });
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Unable to process feedback submission.", error);
    return Response.json({ error: "Unable to send feedback." }, { status: 500 });
  }
}

async function createResendClient(apiKey: string) {
  const resendModule = (await new Function('return import("resend")')()) as {
    Resend: ResendConstructor;
  };

  return new resendModule.Resend(apiKey);
}

function formatAnswer(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry)).join(", ");
  }

  if (value && typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value ?? "");
}
