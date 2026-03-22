import DrataContent from "./content.mdx";
import { PartnerConceptPage, createPartnerMetadata } from "../_components";
import { requirePartnerAccess } from "@/lib/partner-access-server";

export const metadata = createPartnerMetadata({
  title: "Partner Concept",
  description:
    "Private partner walkthrough materials for an evidence integrity integration concept.",
  path: "/partner/drata",
});

export default async function DrataPartnerPage() {
  await requirePartnerAccess("drata");

  return (
    <PartnerConceptPage
      audience="Private Drata partner walkthrough"
      title="Drata + TrustSignal: Integrity Verification Concept"
      content={DrataContent}
      partnerLabel="Drata"
    />
  );
}
