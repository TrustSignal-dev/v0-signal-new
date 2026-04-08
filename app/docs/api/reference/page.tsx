import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { DocLayoutShell, DocHeader } from "../../_components";

export const metadata: Metadata = createPageMetadata({
  title: "API Reference",
  description:
    "Interactive OpenAPI reference for the TrustSignal verification lifecycle API.",
  path: "/docs/api/reference",
  keywords: [
    "TrustSignal API reference",
    "OpenAPI",
    "verification API",
    "receipt lifecycle",
  ],
});

export default function ApiReferencePage() {
  return (
    <DocLayoutShell>
      <DocHeader
        eyebrow="Developer Docs"
        title="API Reference"
        description="Interactive reference for the TrustSignal Public Verification API. All routes require an API key passed via the x-api-key header."
        audience="Developers and technical evaluators"
      />

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Swagger UI loaded from CDN — no npm dependency required */}
        <SwaggerViewer specUrl="/openapi.yaml" />
      </div>

      <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
        <a
          href="/openapi.yaml"
          download
          className="rounded-full border border-slate-200 px-4 py-2 text-foreground hover:bg-slate-50"
        >
          Download OpenAPI spec (.yaml)
        </a>
        <span>OpenAPI 3.0.3 · Version 1.1.0</span>
      </div>
    </DocLayoutShell>
  );
}

// Isolated client component so the rest of the page stays server-rendered.
function SwaggerViewer({ specUrl }: { specUrl: string }) {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css"
      />
      <div id="swagger-ui-root" className="min-h-[600px]" />
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js" />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('DOMContentLoaded', function() {
              if (typeof SwaggerUIBundle === 'undefined') return;
              SwaggerUIBundle({
                url: ${JSON.stringify(specUrl)},
                dom_id: '#swagger-ui-root',
                presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
                layout: 'BaseLayout',
                deepLinking: true,
                displayRequestDuration: true,
              });
            });
          `,
        }}
      />
    </>
  );
}
