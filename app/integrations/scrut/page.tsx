import { redirect } from "next/navigation";

export default function ScrutIntegrationRedirectPage() {
  redirect("/partner-access?partner=scrut");
}
