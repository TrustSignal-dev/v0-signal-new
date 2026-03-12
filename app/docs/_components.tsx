import Link from "next/link";

export function DocsSection({
  title,
  intro,
  mermaid,
  code,
  codeLabel,
}: {
  title: string;
  intro: string;
  mermaid: string;
  code: string;
  codeLabel: string;
}) {
  return (
    <article className="space-y-8">
      <header className="space-y-4">
        <h1 className="text-4xl font-display tracking-tight lg:text-6xl">{title}</h1>
        <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground lg:text-xl">
          {intro}
        </p>
      </header>

      <section className="border border-foreground/10 bg-foreground/[0.02] p-6">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Mermaid Diagram
        </p>
        <pre className="overflow-x-auto whitespace-pre text-sm leading-relaxed text-foreground/80">
          {mermaid}
        </pre>
      </section>

      <section className="border border-foreground/10 bg-background p-6">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {codeLabel}
        </p>
        <pre className="overflow-x-auto whitespace-pre text-sm leading-relaxed text-foreground/85">
          {code}
        </pre>
      </section>
    </article>
  );
}

export function DocsIndexCard({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link
      href={href}
      className="border border-foreground/10 bg-foreground/[0.02] p-5 transition-colors hover:border-foreground/20"
    >
      <h2 className="text-2xl font-display tracking-tight">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </Link>
  );
}
