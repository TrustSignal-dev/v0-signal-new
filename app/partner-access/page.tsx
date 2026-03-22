import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata } from "@/lib/seo";
import { PARTNERS, PARTNER_LABELS, isPartnerSlug } from "@/lib/partner-access";

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Partner Access",
    description: "Private access page for partner walkthrough materials.",
    path: "/partner-access",
    keywords: ["partner access"],
  }),
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

type SearchParams = Promise<{
  partner?: string;
  error?: string;
}>;

export default async function PartnerAccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const partner = isPartnerSlug(params.partner) ? params.partner : "";
  const hasError = params.error === "invalid";
  const hasConfigError = params.error === "config";

  return (
    <div className="mx-auto max-w-2xl">
      <div className="overflow-hidden rounded-[1.75rem] border border-border/60 bg-background/90">
        <div className="border-b border-border/60 bg-muted/20 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Private Partner Access
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
            Select your partner and enter the password
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
            Choose the partner walkthrough you want to open, then enter the
            matching password for that private TrustSignal concept page.
          </p>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/8 p-4">
            <p className="text-sm leading-7 text-foreground/85">
              These pages are partner walkthrough materials, not public product claims
              or announced native integrations.
            </p>
          </div>

          <form action="/api/partner-access" method="post" className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="partner"
                className="text-sm font-medium text-foreground"
              >
                Partner
              </label>
              <select
                id="partner"
                name="partner"
                defaultValue={partner || ""}
                className="h-11 w-full rounded-xl border border-border/60 bg-background px-3 text-sm text-foreground"
                required
              >
                <option value="" disabled>
                  Select a partner
                </option>
                {PARTNERS.map((option) => (
                  <option key={option} value={option}>
                    {PARTNER_LABELS[option]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="h-11 w-full rounded-xl border border-border/60 bg-background px-3 text-sm text-foreground"
                autoComplete="current-password"
                required
              />
            </div>

            {hasError ? <p className="text-sm text-red-600">Invalid password.</p> : null}
            {hasConfigError ? (
              <p className="text-sm text-red-600">
                Partner access is temporarily unavailable. The session secret is not configured.
              </p>
            ) : null}

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
            >
              Continue
            </button>
          </form>

          <div className="flex flex-wrap gap-3 border-t border-border/60 pt-4 text-sm text-muted-foreground">
            <Link href="/docs" className="underline underline-offset-4">
              Public docs
            </Link>
            <Link href="/#pilot-request" className="underline underline-offset-4">
              Pilot request
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
