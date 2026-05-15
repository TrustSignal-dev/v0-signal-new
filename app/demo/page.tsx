import type { Metadata } from "next";
import { DemoPlayground } from "./demo-playground";

export const metadata: Metadata = {
  title: "Integrity Demo | TrustSignal",
  description:
    "Live demo: ingest a mortgage document, anchor it with a TrustSignal receipt, and verify its integrity — watch how a single field change triggers an integrity failure.",
  robots: { index: false, follow: false },
};

export default function DemoPage() {
  return <DemoPlayground />;
}
