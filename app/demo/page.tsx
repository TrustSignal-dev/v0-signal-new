import type { Metadata } from "next";
import { DemoPlayground } from "./demo-playground";
import TrustSignalNav from "@/components/landing/TrustSignalNav";
import TrustSignalFooter from "@/components/landing/TrustSignalFooter";

export const metadata: Metadata = {
  title: "Integrity Demo | TrustSignal",
  description:
    "Live demo: ingest a mortgage document, anchor it with a TrustSignal receipt, and verify its integrity — watch how a single field change triggers an integrity failure.",
  robots: { index: false, follow: false },
};

export default function DemoPage() {
  return (
    <div style={{ background: "#FAFAF8", minHeight: "100vh" }}>
      <TrustSignalNav />
      <DemoPlayground />
      <TrustSignalFooter />
    </div>
  );
}
