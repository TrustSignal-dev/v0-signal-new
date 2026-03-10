import { get, list } from "@vercel/blob";

type Submission = {
  pathname: string;
  submittedAt: string;
  name: string;
  company: string;
  address: string;
  email: string;
  phone: string;
};

export const dynamic = "force-dynamic";

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
          Submission review access
        </h1>
        <p className="mb-10 text-base leading-relaxed text-muted-foreground">
          Enter the review access code to inspect pilot requests stored in Vercel
          Blob.
        </p>
        <form className="space-y-4 border border-foreground/10 bg-background p-8">
          <label className="block space-y-2">
            <span className="text-sm font-medium">Access code</span>
            <input
              name="token"
              type="password"
              className="h-12 w-full border border-foreground/15 bg-background px-4 text-sm outline-none transition focus:border-foreground"
              placeholder="Review access code"
            />
          </label>
          <button
            type="submit"
            className="h-12 w-full rounded-full bg-foreground px-6 text-sm font-medium text-background hover:bg-foreground/90"
          >
            Unlock review dashboard
          </button>
          <p className="text-xs text-muted-foreground">
            Set <code>REVIEW_DASHBOARD_TOKEN</code> in Vercel to enable access.
          </p>
        </form>
      </main>
    );
  }

  const response = await list({ prefix: "pilot-requests/" });
  const blobs = [...response.blobs].sort((a, b) =>
    b.pathname.localeCompare(a.pathname),
  );

  const submissions = await Promise.all(
    blobs.slice(0, 50).map(async (blob) => {
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

  return (
    <main className="mx-auto max-w-6xl px-6 py-16 lg:px-12 lg:py-20">
      <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-3 font-mono text-sm uppercase tracking-[0.18em] text-muted-foreground">
            Private Review
          </p>
          <h1 className="text-4xl font-display tracking-tight">Pilot request submissions</h1>
          <p className="mt-3 text-base text-muted-foreground">
            Latest requests stored privately in Vercel Blob.
          </p>
        </div>
        <a
          href="/review"
          className="rounded-full border border-foreground/15 px-5 py-3 text-sm hover:bg-foreground/5"
        >
          Lock dashboard
        </a>
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
                  <strong className="text-foreground">Blob path:</strong> {submission.pathname}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
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
