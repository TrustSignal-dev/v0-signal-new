import ScrutContent from "@/app/partner/scrut/content.mdx";
import { PartnerConceptPage, createPartnerMetadata } from "@/app/partner/_components";

export const metadata = createPartnerMetadata({
  title: "Scrut Demo",
  description:
    "Private Scrut walkthrough materials for an evidence integrity integration concept.",
  path: "/docs/scrut-demo",
});

export default function DocsScrutDemoPage() {
  return (
    <PartnerConceptPage
      audience="Private Scrut partner walkthrough"
      title="Scrut + TrustSignal: Evidence Integrity Concept"
      content={ScrutContent}
      partnerLabel="Scrut"
    />
  );
}
