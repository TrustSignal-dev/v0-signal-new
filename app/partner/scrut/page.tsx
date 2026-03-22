import ScrutContent from "./content.mdx";
import { PartnerConceptPage, createPartnerMetadata } from "../_components";
import { requirePartnerAccess } from "@/lib/partner-access-server";

export const metadata = createPartnerMetadata({
  title: "Partner Concept",
  description:
    "Private partner walkthrough materials for an evidence integrity integration concept.",
  path: "/partner/scrut",
});

export default async function ScrutPartnerPage() {
  await requirePartnerAccess("scrut");

  return (
    <PartnerConceptPage
      audience="Private Scrut partner walkthrough"
      title="Scrut + TrustSignal: Evidence Integrity Concept"
      content={ScrutContent}
      partnerLabel="Scrut"
    />
  );
}
