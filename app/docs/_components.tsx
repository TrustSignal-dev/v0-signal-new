import Link from "next/link";
import { ArrowRight, BookOpen, Home, ShieldCheck } from "lucide-react";

export const DOCS_NAV = [
  { href: "/docs/api", title: "API Overview", description: "Verification lifecycle and endpoint model." },
  { href: "/docs/verification", title: "Quick Verification", description: "Practical request/response and field guidance." },
  { href: "/docs/security", title: "Security Model", description: "Authentication, lifecycle checks, and controls." },
  { href: "/docs/threat-model", title: "Threat Model", description: "Public threat scenarios and mitigations." },
  { href: "/docs/architecture", title: "Architecture", description: "Integrity-layer fit and trust boundaries." },
] as const;

export function DocsIndexCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group border border-foreground/10 bg-foreground/[0.02] p-5 transition-all hover:-translate-y-0.5 hover:border-foreground/20"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-display tracking-tight">{title}</h2>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </Link>
  );
}

export function DocsShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <article className="space-y-10">
      <header className="space-y-4">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {eyebrow}
        </p>
        <h1 className="text-4xl font-display tracking-tight lg:text-6xl">{title}</h1>
        <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground lg:text-xl">{intro}</p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <div className="border border-foreground/10 bg-foreground/[0.02] p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Developer Docs</p>
            <div className="mt-4 space-y-2 text-sm">
              <Link href="/docs" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <BookOpen className="h-4 w-4" />
                Docs Home
              </Link>
              <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <Home className="h-4 w-4" />
                Homepage
              </Link>
            </div>
          </div>

          <nav className="border border-foreground/10 bg-background p-4">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Pages</p>
            <ul className="space-y-2 text-sm">
              {DOCS_NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-muted-foreground hover:text-foreground">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <div className="space-y-8">{children}</div>
      </div>
    </article>
  );
}

export function SectionBlock({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="border border-foreground/10 bg-background p-6 lg:p-7">
      <h2 className="text-2xl font-display tracking-tight lg:text-3xl">{title}</h2>
      {description ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground lg:text-base">{description}</p>
      ) : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}

export function DiagramPanel({
  title,
  steps,
}: {
  title: string;
  steps: string[];
}) {
  return (
    <section className="border border-foreground/10 bg-foreground/[0.02] p-6">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
      <div className="mt-5 grid gap-3 md:grid-cols-[repeat(4,minmax(0,1fr))]">
        {steps.map((step, index) => (
          <div key={step} className="relative border border-foreground/12 bg-background px-4 py-4 text-sm">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">0{index + 1}</p>
            <p className="mt-2 leading-relaxed text-foreground/85">{step}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CodePanel({
  label,
  code,
}: {
  label: string;
  code: string;
}) {
  return (
    <section className="overflow-hidden border border-foreground/10 bg-background">
      <div className="border-b border-foreground/10 px-5 py-3">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      </div>
      <pre className="overflow-x-auto whitespace-pre p-5 text-sm leading-relaxed text-foreground/85">{code}</pre>
    </section>
  );
}

export function ClaimsBoundaryPanel() {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <div className="border border-foreground/10 bg-background p-5">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">TrustSignal provides</p>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>Signed verification receipts</li>
          <li>Verification signals</li>
          <li>Verifiable provenance metadata</li>
        </ul>
      </div>
      <div className="border border-foreground/10 bg-background p-5">
        <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          TrustSignal does not provide
        </p>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>Legal determinations</li>
          <li>Compliance certification</li>
          <li>Fraud adjudication</li>
          <li>Replacement for systems of record</li>
        </ul>
      </div>
    </section>
  );
}
