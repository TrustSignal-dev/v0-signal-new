"use client";

import TrustSignalNav from "./TrustSignalNav";
import TrustSignalFooter from "./TrustSignalFooter";
import TrustSignalHero from "./TrustSignalHero";
import TrustSignalAudience from "./TrustSignalAudience";
import TrustSignalPilot from "./TrustSignalPilot";
import TrustSignalPilotForm from "./TrustSignalPilotForm";
import TrustSignalDevelopers from "./TrustSignalDevelopers";

/**
 * TrustSignal — full landing page
 * Composes the section components with a sticky nav and footer.
 */

const PALETTE = {
  paper: "#FAFAF8",
};

export default function TrustSignalPage() {
  return (
    <div id="top" style={{ background: PALETTE.paper }}>
      <style>{pageCss}</style>
      <TrustSignalNav />
      <TrustSignalHero />
      <TrustSignalAudience />
      <TrustSignalPilot />
      <TrustSignalPilotForm />
      <TrustSignalDevelopers />
      <TrustSignalFooter />
    </div>
  );
}

const pageCss = `
  html { scroll-behavior: smooth; }
  ::selection { background: #4D5AF0; color: #FFFFFF; }
`;
