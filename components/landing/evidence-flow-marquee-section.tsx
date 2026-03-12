"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  FileCheck2,
  FileText,
  ShieldCheck,
  Workflow,
} from "lucide-react";

const SOURCE_POSITION = 11;
const PLATFORM_POSITION = 37;
const TRUSTSIGNAL_POSITION = 62;
const OUTPUT_POSITION = 88;

function getChipPosition(phase: number) {
  switch (phase) {
    case 1:
    case 2:
      return PLATFORM_POSITION;
    case 3:
    case 4:
      return TRUSTSIGNAL_POSITION;
    case 5:
      return OUTPUT_POSITION;
    default:
      return SOURCE_POSITION;
  }
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  return prefersReducedMotion;
}

type WorkflowNodeProps = {
  label: string;
  eyebrow: string;
  icon: typeof Database;
  highlight?: boolean;
  hidden?: boolean;
  verified?: boolean;
};

function WorkflowNode({
  label,
  eyebrow,
  icon: Icon,
  highlight = false,
  hidden = false,
  verified = false,
}: WorkflowNodeProps) {
  return (
    <div
      className={`relative z-10 flex w-[84px] flex-col items-center text-center transition-all duration-500 sm:w-[112px] ${
        hidden ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div
        className={`relative flex h-12 w-12 items-center justify-center border sm:h-14 sm:w-14 ${
          highlight
            ? "border-foreground/30 bg-foreground/[0.06] shadow-[0_18px_40px_rgba(31,26,20,0.08)]"
            : "border-foreground/12 bg-background/90"
        }`}
      >
        <Icon className="h-5 w-5 text-foreground/75" />
        {verified ? (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-foreground/15 bg-background">
            <CheckCircle2 className="h-3.5 w-3.5 text-foreground" />
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:text-[11px]">
        {eyebrow}
      </p>
      <p className="mt-2 text-sm leading-tight text-foreground sm:text-base">
        {label}
      </p>
      {highlight ? (
        <span className="mt-3 inline-flex border border-foreground/12 bg-background/80 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Integrity control point
        </span>
      ) : null}
    </div>
  );
}

export function EvidenceFlowMarqueeSection() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [phase, setPhase] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    if (prefersReducedMotion) {
      setPhase(5);
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    if (isPaused) {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    const phaseDurations = [900, 900, 1000, 900, 1000, 1200, 200] as const;
    let cancelled = false;

    const runPhaseLoop = (currentPhase: number) => {
      timeoutRef.current = window.setTimeout(() => {
        if (cancelled || pausedRef.current) {
          return;
        }

        const nextPhase = (currentPhase + 1) % phaseDurations.length;
        setPhase(nextPhase);
        runPhaseLoop(nextPhase);
      }, phaseDurations[currentPhase]);
    };

    runPhaseLoop(phase);

    return () => {
      cancelled = true;
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isPaused, prefersReducedMotion]);

  const activePhase = prefersReducedMotion ? 5 : phase;
  const chipPosition = getChipPosition(activePhase);
  const showChip = prefersReducedMotion || phase !== 6;
  const showBrokenLine = prefersReducedMotion || (phase >= 2 && phase < 6);
  const showWarning = !prefersReducedMotion && phase === 2;
  const showTrustSignal = prefersReducedMotion || (phase >= 3 && phase < 6);
  const showSignedState = prefersReducedMotion || (phase >= 4 && phase < 6);
  const showVerifiedState = prefersReducedMotion || phase === 5;
  const outputLabel = showVerifiedState ? "Verification Signal" : "Signed Output";

  return (
    <section id="integrity-model" className="relative border-t border-foreground/10 py-20 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="max-w-3xl">
          <span className="inline-flex items-center border border-foreground/10 bg-background/80 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Integrity model
          </span>
          <h2 className="mt-6 text-4xl font-display tracking-tight lg:text-6xl">
            Verification receipts through the artifact lifecycle
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground lg:text-xl">
            Submit an artifact or artifact reference, receive a verification
            result with a signed receipt, store it with the artifact, and run
            later integrity checks when needed.
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border border-foreground/10 bg-foreground/[0.02] px-4 py-3 text-sm text-muted-foreground">
            1. Submit artifact or artifact reference
          </div>
          <div className="border border-foreground/10 bg-foreground/[0.02] px-4 py-3 text-sm text-muted-foreground">
            2. Receive verification result and signed receipt
          </div>
          <div className="border border-foreground/10 bg-foreground/[0.02] px-4 py-3 text-sm text-muted-foreground">
            3. Store receipt alongside artifact
          </div>
          <div className="border border-foreground/10 bg-foreground/[0.02] px-4 py-3 text-sm text-muted-foreground">
            4. Verify again later if needed
          </div>
        </div>

        <div
          data-testid="integrity-workflow-diagram"
          className="mt-12 border border-foreground/10 bg-gradient-to-br from-background via-background to-foreground/[0.02] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.04)] lg:p-8"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onPointerEnter={() => setIsPaused(true)}
          onPointerLeave={() => setIsPaused(false)}
        >
          <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors duration-300 ${
                  showVerifiedState
                    ? "border-foreground/10 text-muted-foreground"
                    : "border-foreground/20 bg-foreground/[0.04] text-foreground"
                }`}
              >
                Artifact submitted
              </span>
            <span
              className={`inline-flex items-center border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors duration-300 ${
                showVerifiedState
                  ? "border-foreground/20 bg-foreground/[0.04] text-foreground"
                  : "border-foreground/10 text-muted-foreground"
              }`}
            >
              Signed receipt attached
            </span>
          </div>

          <div className="relative mt-10 overflow-hidden">
            <div className="absolute left-[14%] top-6 h-px w-[18%] bg-foreground/20" />

            <div
              className={`absolute left-[40%] top-6 h-px w-[46%] transition-all duration-500 ${
                showBrokenLine
                  ? showVerifiedState
                    ? "border-t border-solid border-foreground/25 opacity-100"
                    : "border-t border-dashed border-foreground/35 opacity-100"
                  : "opacity-0"
              }`}
            />

            <div
              className={`absolute left-[69%] top-[6px] transition-all duration-500 ${
                showWarning ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
              }`}
            >
              <span className="inline-flex items-center gap-2 border border-foreground/15 bg-background/95 px-3 py-1 text-xs text-muted-foreground shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
                <AlertTriangle className="h-3.5 w-3.5 text-foreground/70" />
                Missing provenance
              </span>
            </div>

            <div
              data-testid="integrity-workflow-chip"
              className={`absolute top-2 z-20 transition-all duration-700 ${
                showChip ? "opacity-100" : "opacity-0"
              } ${phase === 6 ? "duration-0" : ""}`}
              style={{
                left: `${chipPosition}%`,
                transform: "translateX(-50%)",
              }}
            >
              <div
                className={`inline-flex items-center gap-2 border px-3 py-2 text-xs shadow-[0_14px_36px_rgba(0,0,0,0.08)] transition-all duration-500 ${
                  showSignedState
                    ? "border-foreground/25 bg-foreground/[0.06] text-foreground"
                    : "border-foreground/15 bg-background text-muted-foreground"
                }`}
              >
                {showSignedState ? (
                  <FileCheck2 className="h-3.5 w-3.5 text-foreground/80" />
                ) : (
                  <FileText className="h-3.5 w-3.5 text-foreground/70" />
                )}
                <span className="font-mono uppercase tracking-[0.14em]">
                  {showSignedState ? "Signed receipt" : "Artifact"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 pt-12 sm:gap-4 sm:pt-14">
              <WorkflowNode
                label="Source System"
                eyebrow="Collection"
                icon={Database}
              />
              <WorkflowNode
                label="Compliance Platform"
                eyebrow="Review workflow"
                icon={Workflow}
              />
              <WorkflowNode
                label="TrustSignal"
                eyebrow="Integrity layer"
                icon={ShieldCheck}
                highlight
                hidden={!showTrustSignal}
              />
              <WorkflowNode
                label={outputLabel}
                eyebrow="Output"
                icon={FileCheck2}
                verified={showVerifiedState}
              />
            </div>

            <div
              className={`mt-6 inline-flex items-center gap-2 border px-3 py-1 text-xs transition-all duration-500 ${
                showSignedState
                  ? "border-foreground/20 bg-foreground/[0.04] text-foreground"
                  : "border-foreground/10 text-muted-foreground opacity-0"
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-foreground/75" />
              Signed receipt and verification signal attached
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
