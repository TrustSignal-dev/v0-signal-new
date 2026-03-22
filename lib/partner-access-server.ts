import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getPartnerCookieName,
  type PartnerSlug,
  verifyPartnerAccessToken,
} from "@/lib/partner-access";

export async function requirePartnerAccess(partner: PartnerSlug) {
  const cookieStore = await cookies();
  const token = cookieStore.get(getPartnerCookieName(partner))?.value;

  if (await verifyPartnerAccessToken(partner, token)) {
    return;
  }

  redirect(`/partner-access?partner=${partner}`);
}
