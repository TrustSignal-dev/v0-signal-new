import type { Metadata } from "next";
import { get, list } from "@vercel/blob";
import { createPageMetadata } from "@/lib/seo";

type Submission = {
  pathname: string;
  submittedAt: string;
  name: string;
  company: string;
  address: string;
  email: string;
  phone: string;
};

type DeveloperAccessSubmission = {
  pathname: string;
  submittedAt: string;
  accessMethod: "github" | "email";
  fullName: string;
  company: string;
  role: string;
  email: string;
  phone?: string;
  githubUsername?: string;
  githubProfileUrl?: string;
  useCase: string;
};

export const dynamic = "force-dynamic";
export const metadata: Metadata = createPageMetadata({
  title: "Private Review Access",
  description:
    "Private access point for TrustSignal pilot request review.",
  path: "/review",
  keywords: ["private review", "pilot request review"],
  noIndex: true,
});

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const expectedToken = process.env.REVIEW_DASHBOARD_TOKEN;
  const isAuthorized =
    Boolean(expectedToken) && params.token === expectedToken;

  if (!isAuthorized) {
    return (
      <main className="mx-auto max-w-xl px-6 py-20 lg:px-12 lg:py-28">
        <p className="mb-4 font-mono text-sm uppercase tracking-[0.18em] text-muted-foreground">
          Private Review
        </p>
        <h1 className="mb-6 text-4xl font-display tracking-tight">
          Pilot request review access
        </h1>
        <p className="mb-10 text-base leading-relaxed text-muted-foreground">
          Enter the access code to inspect pilot requests submitted through the
          public site.
        </p>
        <form className="space-y-4 border border-foreground/10 bg-background p-8">
          <label className="block space-y-2">
            <span className="text-sm font-medium">Access code</span>
            <input
              name="token"
              type="password"
              className="h-12 w-full border border-foreground/15 bg-background px-4 text-sm outline-none transition focus:border-foreground"
              placeholder="Review access code"
              autoComplete="current-password"
            />
          </label>
          <button
            type="submit"
            className="h-12 w-full rounded-full bg-foreground px-6 text-sm font-medium text-background hover:bg-foreground/90"
          >
            Open review dashboard
          </button>
          <p className="text-xs text-muted-foreground">
            Access is limited to TrustSignal operators.
          </p>
        </form>
      </main>
    );
  }

  const pilotResponse = await list({ prefix: "pilot-requests/" });
  const pilotBlobs = [...pilotResponse.blobs].sort((a, b) =>
    b.pathname.localeCompare(a.pathname),
  );

  const accessResponse = await list({ prefix: "developer-access-requests/" });
  const accessBlobs = [...accessResponse.blobs].sort((a, b) =>
    b.pathname.localeCompare(a.pathname),
  );

  const submissions = await Promise.all(
    pilotBlobs.slice(0, 50).map(async (blob) => {
      const result = await get(blob.pathname, { access: "private" });

      if (!result || result.statusCode !== 200 || !result.stream) {
        return null;
      }

      const text = await new Response(result.stream).text();
      const parsed = JSON.parse(text) as Omit<Submission, "pathname">;

      return {
        pathname: blob.pathname,
        ...parsed,
      } satisfies Submission;
    }),
  );

  const visibleSubmissions = submissions.filter(
    (submission): submission is Submission => submission !== null,
  );

  const developerAccessSubmissions = await Promise.all(
    accessBlobs.slice(0, 50).map(async (blob) => {
      const result = await get(blob.pathname, { access: "private" });

      if (!result || result.statusCode !== 200 || !result.stream) {
        return null;
      }

      const text = await new Response(result.stream).text();
      const parsed = JSON.parse(text) as Omit<DeveloperAccessSubmission, "pathname">;

      return {
        pathname: blob.pathname,
        ...parsed,
      } satisfies DeveloperAccessSubmission;
    }),
  );

  const visibleDeveloperAccessSubmissions = developerAccessSubmissions.filter(
    (submission): submission is DeveloperAccessSubmission => submission !== null,
  );

  return (
    <main className="mx-auto max-w-6xl px-6 py-16 lg:px-12 lg:py-20">
      <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-3 font-mono text-sm uppercase tracking-[0.18em] text-muted-foreground">
            Private Review
          </p>
          <h1 className="text-4xl font-display tracking-tight">Pilot request submissions</h1>
          <p className="mt-3 text-base text-muted-foreground">
            Recent pilot requests available for TrustSignal review.
          </p>
        </div>
        <a
          href="/review"
          className="rounded-full border border-foreground/15 px-5 py-3 text-sm hover:bg-foreground/5"
        >
          Lock dashboard
        </a>
      </div>

      <section className="mb-14">
        <div className="mb-6">
          <p className="mb-3 font-mono text-sm uppercase tracking-[0.18em] text-muted-foreground">
            Developer Access
          </p>
          <h2 className="text-3xl font-display tracking-tight">Developer access requests</h2>
          <p className="mt-3 text-base text-muted-foreground">
            Recent requests submitted through the API access signup flow.
          </p>
        </div>

        {visibleDeveloperAccessSubmissions.length === 0 ? (
          <div className="border border-dashed border-foreground/15 p-10 text-muted-foreground">
            No developer access requests have been stored yet.
          </div>
        ) : (
          <div className="space-y-5">
            {visibleDeveloperAccessSubmissions.map((submission) => (
              <article
                key={submission.pathname}
                className="grid gap-6 border border-foreground/10 bg-background p-6 lg:grid-cols-[1.2fr_0.8fr]"
              >
                <div className="space-y-3">
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {formatDate(submission.submittedAt)}
                  </p>
                  <h3 className="text-2xl font-display tracking-tight">
                    {submission.fullName}
                  </h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p><strong className="text-foreground">Company:</strong> {submission.company}</p>
                    <p><strong className="text-foreground">Role:</strong> {submission.role}</p>
                    <p><strong className="text-foreground">Email:</strong> {submission.email}</p>
                    <p><strong className="text-foreground">Method:</strong> {submission.accessMethod}</p>
                    {submission.githubUsername ? (
                      <p><strong className="text-foreground">GitHub:</strong> {submission.githubUsername}</p>
                    ) : null}
                  </div>
                </div>
                <div className="space-y-3 text-sm text-muted-foreground">
                  {submission.phone ? (
                    <p><strong className="text-foreground">Phone:</strong> {submission.phone}</p>
                  ) : null}
                  {submission.githubProfileUrl ? (
                    <p className="break-all">
                      <strong className="text-foreground">Profile:</strong> {submission.githubProfileUrl}
                    </p>
                  ) : null}
                  <p>
                    <strong className="text-foreground">Use case:</strong> {submission.useCase}
                  </p>
                  <p className="break-all">
                    <strong className="text-foreground">Submission ID:</strong> {submission.pathname}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-6">
          <p className="mb-3 font-mono text-sm uppercase tracking-[0.18em] text-muted-foreground">
            Pilot Requests
          </p>
          <h2 className="text-3xl font-display tracking-tight">Pilot request submissions</h2>
          <p className="mt-3 text-base text-muted-foreground">
            Recent pilot and integration requests submitted through the public site.
          </p>
        </div>

      {visibleSubmissions.length === 0 ? (
        <div className="border border-dashed border-foreground/15 p-10 text-muted-foreground">
          No pilot requests have been stored yet.
        </div>
      ) : (
        <div className="space-y-5">
          {visibleSubmissions.map((submission) => (
            <article
              key={submission.pathname}
              className="grid gap-6 border border-foreground/10 bg-background p-6 lg:grid-cols-[1.3fr_1fr]"
            >
              <div className="space-y-3">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {formatDate(submission.submittedAt)}
                </p>
                <h2 className="text-2xl font-display tracking-tight">
                  {submission.name}
                </h2>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p><strong className="text-foreground">Company:</strong> {submission.company}</p>
                  <p><strong className="text-foreground">Email:</strong> {submission.email}</p>
                  <p><strong className="text-foreground">Phone:</strong> {submission.phone}</p>
                </div>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Address:</strong> {submission.address}
                </p>
                <p className="break-all">
                  <strong className="text-foreground">Submission ID:</strong> {submission.pathname}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
      </section>
    </main>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
