import VantaContent from "./content.mdx";
import { PartnerConceptPage, createPartnerMetadata } from "../_components";
import { requirePartnerAccess } from "@/lib/partner-access-server";

export const metadata = createPartnerMetadata({
  title: "Partner Concept",
  description:
    "Private partner walkthrough materials for an evidence integrity integration concept.",
  path: "/partner/vanta",
});

export default async function VantaPartnerPage() {
  await requirePartnerAccess("vanta");

  return (
    <PartnerConceptPage
      audience="Private Vanta partner walkthrough"
      title="Vanta + TrustSignal: Integrity Verification Concept"
      content={VantaContent}
      partnerLabel="Vanta"
    />
  );
}
