export default function SecurityPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-20 lg:px-12 lg:py-28">
      <p className="mb-4 font-mono text-sm uppercase tracking-[0.18em] text-muted-foreground">
        Security
      </p>
      <h1 className="mb-8 text-4xl font-display tracking-tight lg:text-6xl">
        TrustSignal security posture.
      </h1>
      <div className="space-y-8 text-base leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-3 text-xl font-medium text-foreground">Security model</h2>
          <p>
            TrustSignal is designed around evidence integrity, signed receipts,
            and tamper detection. Public-facing website access is informational
            only and does not expose administrative controls or private system
            operations.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-xl font-medium text-foreground">Safe defaults</h2>
          <p>
            The site is deployed behind managed hosting, TLS, and restricted form
            handling. Pilot requests are validated server-side before they are
            relayed to TrustSignal contact channels.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-xl font-medium text-foreground">Access controls</h2>
          <p>
            Public visitors can review marketing and pilot information only.
            Operational workflows, private registries, internal code paths, and
            secrets remain outside the public site boundary.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-xl font-medium text-foreground">Reporting</h2>
          <p>
            Security concerns should be reported to info@trustsignal.dev. Do not
            include sensitive personal data in the initial report.
          </p>
        </section>
      </div>
    </main>
  );
}
