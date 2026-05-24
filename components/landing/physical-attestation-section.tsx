"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MapPin, Nfc, ShieldCheck } from "lucide-react";

const useCases = [
  {
    title: "University Registrars",
    description:
      "Diplomas and transcripts issued or received at the registrar desk carry a physical presence attestation from the moment of handoff — not just a scan or upload timestamp.",
  },
  {
    title: "Title Companies and Notaries",
    description:
      "Closing rooms and notary tables tap at the moment of signing. Physical presence is bound to the receipt alongside the document integrity proof — a complete chain of custody record.",
  },
  {
    title: "Healthcare and Licensing Bodies",
    description:
      "Credentialing desks tap when physical licenses or certifications are reviewed. The receipt proves the document was physically examined at a specific location and time.",
  },
] as const;

const steps = [
  {
    icon: Nfc,
    step: "Step 1 — Tap",
    title: "Staff tap a pre-registered NFC sticker at the moment of physical document collection.",
    detail: "The sticker captures: NFC tag ID, GPS coordinates, timestamp, device ID.",
  },
  {
    icon: ShieldCheck,
    step: "Step 2 — Bind",
    title: "The physical attestation data is cryptographically embedded in the TrustSignal receipt.",
    detail: "Alongside the artifact hash, ZKML proof, and provenance metadata.",
  },
  {
    icon: MapPin,
    step: "Step 3 — Verify",
    title: "Anyone with the receipt ID can later confirm the digital record matches.",
    detail: "And that the physical presence event was recorded at collection time.",
  },
] as const;

const receiptExample = `{
  "receipt_id": "tsig_rcpt_01JTQY8N1Q0M4F4F5T4J4B8Y9R",
  "status": "signed",
  "proof_verified": true,
  "proof_status": "zkml_integrity_check_passed",
  "physical_attestation": {
    "nfc_tag_id": "tsig_nfc_04A3F2C1B8E5D7",
    "tapped_at": "2026-05-21T14:02:33Z",
    "location": {
      "lat": 41.8827,
      "lng": -87.6233,
      "label": "DeVry University Chicago — Registrar Office"
    },
    "device_id": "tsig_device_CHI_REG_01",
    "attestation_status": "verified"
  },
  "policy_profile": "compliance_evidence_integrity_v1"
}`;

export function PhysicalAttestationSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="physical-attestation"
      ref={sectionRef}
      className="relative overflow-hidden border-t border-foreground/10 py-24 lg:py-32"
    >
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-12">
        {/* Header */}
        <div
          className={`mb-16 lg:mb-20 transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <span className="mb-6 inline-flex items-center gap-3 font-mono text-sm text-muted-foreground">
            <Nfc className="h-4 w-4" />
            Physical attestation
          </span>
          <h2 className="text-4xl font-display tracking-tight lg:text-6xl">
            Physical presence.
            <br />
            Cryptographic proof.
            <br />
            <span className="text-muted-foreground">One receipt.</span>
          </h2>
          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-muted-foreground lg:text-xl">
            For documents that exist in the physical world — diplomas, degrees,
            licenses, notarized instruments, closing packages — TrustSignal adds
            an NFC physical attestation layer that binds the moment of collection
            to the cryptographic receipt.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
            Staff tap a pre-registered NFC sticker at the point of collection.
            The tap is cryptographically embedded in the receipt alongside the
            artifact hash and ZKML integrity proof. The result is a single,
            auditable record that answers three questions at once: Was this
            document physically present? Where and when was it collected? Has
            the digital record changed since?
          </p>
        </div>

        {/* Sticker product image */}
        <div
          className={`mb-16 flex justify-center transition-all duration-700 delay-75 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="relative">
            <Image
              src="/holographic-nfc-sticker.jpg"
              alt="TrustSignal holographic NFC attestation sticker — circular, rainbow micro-dot diffraction pattern with TrustSignal logo and verification URL"
              width={280}
              height={280}
              className="rounded-full shadow-[0_24px_80px_rgba(0,0,0,0.12)]"
              priority
            />
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-xs text-muted-foreground">
              25 mm holographic NFC sticker — Enterprise tier
            </span>
          </div>
        </div>

        {/* Use case cards */}
        <div
          className={`mb-16 grid gap-6 md:grid-cols-3 transition-all duration-700 delay-100 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {useCases.map((uc, index) => (
            <div
              key={uc.title}
              className="border border-foreground/10 bg-foreground/[0.02] p-6"
              style={{ transitionDelay: `${index * 80 + 100}ms` }}
            >
              <h3 className="text-xl font-display mb-3">{uc.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{uc.description}</p>
            </div>
          ))}
        </div>

        {/* How it works + receipt example */}
        <div
          className={`grid gap-12 lg:grid-cols-2 lg:gap-16 transition-all duration-700 delay-200 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {/* Steps */}
          <div className="space-y-6">
            <h3 className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground mb-8">
              How it works
            </h3>
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="flex gap-5 border border-foreground/10 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-foreground/15">
                    <Icon className="h-5 w-5 text-foreground/70" />
                  </div>
                  <div>
                    <p className="font-mono text-xs text-muted-foreground mb-1">{s.step}</p>
                    <p className="text-sm font-medium leading-snug">{s.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Receipt example */}
          <div>
            <div className="border border-foreground/10 bg-foreground/[0.02] shadow-[0_24px_80px_rgba(0,0,0,0.04)]">
              <div className="border-b border-foreground/10 px-6 py-4">
                <span className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Receipt with physical_attestation field
                </span>
              </div>
              <div className="overflow-x-auto p-6 font-mono text-sm">
                <pre className="whitespace-pre text-foreground/72">{receiptExample}</pre>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground border border-foreground/10 bg-foreground/[0.02] px-4 py-3">
              NFC attestation records that a document was physically present at a collection
              point, tapped by a registered device, at a specific time and location. It does
              not detect forgery or alteration of the physical document itself.
            </p>
          </div>
        </div>

        {/* Sticker logistics + CTAs */}
        <div
          className={`mt-16 border border-foreground/10 bg-foreground/[0.02] p-6 lg:p-8 transition-all duration-700 delay-300 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                NFC stickers are pre-registered and shipped to your location by TrustSignal.
                First tap activates the sticker automatically. Sticker lifecycle — activation,
                deactivation, reorder — is managed from the TrustSignal dashboard.{" "}
                <span className="font-medium text-foreground">
                  Physical attestation is an Enterprise-tier feature.
                </span>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 lg:justify-end">
              <Button
                asChild
                className="bg-foreground hover:bg-foreground/90 text-background rounded-full px-6"
              >
                <a href="#pilot-request">Request a Pilot</a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full px-6 border-foreground/20"
              >
                <a href={`mailto:hello@trustsignal.dev?subject=Enterprise%20NFC%20Attestation`}>
                  Contact about Enterprise
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
