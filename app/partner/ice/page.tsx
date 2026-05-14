import IceContent from "./content.mdx";
import { PartnerConceptPage, createPartnerMetadata } from "../_components";
import { requirePartnerAccess } from "@/lib/partner-access-server";

export const metadata = createPartnerMetadata({
  title: "Partner Concept",
  description:
    "Private partner walkthrough materials for an evidence integrity integration concept.",
  path: "/partner/ice",
});

export default async function IcePartnerPage() {
  await requirePartnerAccess("ice");

  return (
    <PartnerConceptPage
      audience="Private ICE Mortgage Technology partner walkthrough"
      title="ICE Mortgage Technology + TrustSignal: Loan File Integrity Concept"
      content={IceContent}
      partnerLabel="ICE Mortgage Technology"
    />
  );
}
