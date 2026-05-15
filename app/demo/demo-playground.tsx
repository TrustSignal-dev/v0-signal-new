"use client";

import React, { useState, useCallback, useEffect, useRef, DragEvent } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  FileText,
  Loader2,
  RotateCcw,
  Shield,
  ShieldCheck,
  ShieldX,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Document data
// ---------------------------------------------------------------------------

const ORIGINAL_DOC = {
  document_type: "mortgage_closing_disclosure",
  borrower_name: "Jennifer M. Caldwell",
  loan_amount: "485000",
  interest_rate: "6.125%",
  closing_date: "2024-03-28",
  loan_type: "30-Year Fixed Conventional",
  property_address: "2847 Maple Ridge Drive, Austin TX 78704",
  lender_name: "Meridian Home Finance LLC",
  loan_number: "MHF-2024-038291",
  version: "1.0",
} as const;

const MODIFIED_DOC = {
  ...ORIGINAL_DOC,
  interest_rate: "5.875%", // tampered field
  version: "1.1",
} as const;

type DocRecord = Record<string, string>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function sha256hex(data: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256hexFromBuffer(buf: ArrayBuffer): Promise<string> {
  const hashBuf = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function truncateHash(hash: string): string {
  if (!hash) return "computing…";
  return `${hash.slice(0, 8)}…${hash.slice(-8)}`;
}

function formatCurrency(value: string): string {
  const n = Number(value);
  return isNaN(n) ? value : `$${n.toLocaleString()}`;
}

// ---------------------------------------------------------------------------
// Simulated API responses (used when DEMO_API_KEY is not configured)
// ---------------------------------------------------------------------------

function makeIngestSim(hash: string): Record<string, unknown> {
  return {
    id: `doc_${hash.slice(0, 16)}`,
    artifact_hash: `sha256:${hash}`,
    document_type: "mortgage_closing_disclosure",
    created_at: new Date().toISOString(),
    status: "indexed",
  };
}

function makeAnchorSim(hash: string): Record<string, unknown> {
  return {
    receipt_id: `rcpt_${hash.slice(0, 12)}`,
    artifact_hash: `sha256:${hash}`,
    anchored_at: new Date().toISOString(),
    issuer: "TrustSignal",
    algorithm: "SHA-256",
    chain: "ethereum-mainnet",
    status: "anchored",
    signature: `0x${hash.slice(0, 64)}`,
  };
}

function makeVerifySim(
  verified: boolean,
  submittedHash: string,
  anchoredHash: string,
  receiptId: string,
): Record<string, unknown> {
  if (verified) {
    return {
      verified: true,
      receipt_id: receiptId,
      artifact_hash: `sha256:${submittedHash}`,
      verified_at: new Date().toISOString(),
      message: "Document integrity confirmed. Hash matches anchored record.",
    };
  }
  return {
    verified: false,
    receipt_id: receiptId,
    submitted_hash: `sha256:${submittedHash}`,
    anchored_hash: `sha256:${anchoredHash}`,
    mismatch_detail:
      "Hash mismatch detected. The submitted document does not match the anchored record. Field change detected: interest_rate (6.125% → 5.875%).",
    verified_at: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Step = "select" | "ingest" | "anchor" | "verify";
type DocChoice = "original" | "modified" | "custom";

interface ApiStepState {
  status: "idle" | "loading" | "done" | "error";
  response: Record<string, unknown> | null;
  simulated: boolean;
}

const EMPTY_STEP: ApiStepState = { status: "idle", response: null, simulated: false };

const STEP_META = [
  { id: "select" as const, num: "01", label: "SELECT" },
  { id: "ingest" as const, num: "02", label: "INGEST" },
  { id: "anchor" as const, num: "03", label: "ANCHOR" },
  { id: "verify" as const, num: "04", label: "VERIFY" },
];

// ---------------------------------------------------------------------------
// Proxy call
// ---------------------------------------------------------------------------

async function callProxy(
  action: string,
  payload: Record<string, unknown>,
): Promise<{ data: Record<string, unknown>; needsSim: boolean }> {
  const res = await fetch("/api/demo-proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, payload }),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  const needsSim =
    (res.status === 500 && data.error === "demo key not configured") || res.status === 502;
  return { data, needsSim };
}

// ---------------------------------------------------------------------------
// Step tracker
// ---------------------------------------------------------------------------

function StepTracker({ current }: { current: Step }) {
  const currentIdx = STEP_META.findIndex((s) => s.id === current);
  return (
    <div className="flex items-center justify-center w-full overflow-x-auto py-2 select-none">
      {STEP_META.map((s, i) => {
        const done = i < currentIdx;
        const active = s.id === current;
        return (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center gap-1.5 min-w-[72px]">
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300",
                  active && "border-[#E8503A] bg-[#E8503A] text-white scale-110 shadow-[0_0_16px_#E8503A50]",
                  done && "border-emerald-500 bg-emerald-500/10 text-emerald-400",
                  !active && !done && "border-zinc-700 bg-transparent text-zinc-600",
                )}
              >
                {done ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span
                className={cn(
                  "text-[10px] font-bold tracking-widest transition-colors duration-300",
                  active ? "text-[#E8503A]" : done ? "text-emerald-500" : "text-zinc-700",
                )}
                style={{ fontFamily: "var(--font-space-mono, monospace)" }}
              >
                {s.label}
              </span>
            </div>
            {i < STEP_META.length - 1 && (
              <div
                className={cn(
                  "h-px flex-1 max-w-[56px] mx-1 transition-all duration-500",
                  done ? "bg-emerald-500/40" : "bg-zinc-800",
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Document field row
// ---------------------------------------------------------------------------

function DocField({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between items-start py-2 border-b border-zinc-800/50 last:border-0 gap-4">
      <span className="text-zinc-500 text-[11px] uppercase tracking-wider shrink-0">{label}</span>
      <span
        className={cn(
          "text-[12px] text-right leading-relaxed",
          highlight ? "text-[#E8503A] font-semibold" : "text-zinc-200",
        )}
        style={highlight ? undefined : { fontFamily: "var(--font-space-mono, monospace)" }}
      >
        {value}
        {highlight && (
          <span className="ml-2 inline-flex items-center gap-1 bg-[#E8503A]/10 text-[#E8503A] text-[9px] px-1.5 py-0.5 rounded font-sans tracking-wider">
            <AlertTriangle className="w-2.5 h-2.5" />
            CHANGED
          </span>
        )}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hash preview with copy button
// ---------------------------------------------------------------------------

function HashPreview({ hash }: { hash: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!hash) return;
    await navigator.clipboard.writeText(`sha256:${hash}`).catch(() => null);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="mt-3 pt-3 border-t border-zinc-800/50">
      <span
        className="text-zinc-700 text-[9px] uppercase tracking-widest"
        style={{ fontFamily: "var(--font-space-mono, monospace)" }}
      >
        SHA-256
      </span>
      <div className="flex items-center gap-2 mt-1">
        <code
          className="text-zinc-500 text-[11px] flex-1 truncate"
          style={{ fontFamily: "var(--font-space-mono, monospace)" }}
        >
          {hash ? `sha256:${truncateHash(hash)}` : "computing…"}
        </code>
        <button
          onClick={handleCopy}
          disabled={!hash}
          className="text-zinc-700 hover:text-zinc-400 transition-colors p-0.5 disabled:opacity-30"
          title="Copy full hash"
        >
          {copied ? (
            <Check className="w-3 h-3 text-emerald-400" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Document card
// ---------------------------------------------------------------------------

interface DocumentCardProps {
  title: string;
  badge: "original" | "modified";
  doc: DocRecord;
  hash: string;
  selected: boolean;
  onSelect: () => void;
}

function DocumentCard({ title, badge, doc, hash, selected, onSelect }: DocumentCardProps) {
  return (
    <button
      className={cn(
        "relative rounded-2xl border p-5 text-left cursor-pointer transition-all duration-200 bg-zinc-900/60 w-full",
        selected
          ? "border-[#E8503A] shadow-[0_0_0_1px_#E8503A40,0_0_28px_#E8503A18]"
          : "border-zinc-800 hover:border-zinc-600",
      )}
      onClick={onSelect}
      type="button"
    >
      {/* Card header */}
      <div className="flex items-start justify-between mb-4 gap-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-zinc-500 shrink-0" />
          <span className="text-sm font-semibold text-zinc-100">{title}</span>
        </div>
        <span
          className={cn(
            "text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded-full shrink-0",
            badge === "original"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-[#E8503A]/10 text-[#E8503A] border border-[#E8503A]/20",
          )}
          style={{ fontFamily: "var(--font-space-mono, monospace)" }}
        >
          {badge === "original" ? "ORIGINAL" : "MODIFIED"}
        </span>
      </div>

      <p
        className="text-zinc-600 text-[10px] uppercase tracking-widest mb-3"
        style={{ fontFamily: "var(--font-space-mono, monospace)" }}
      >
        Mortgage Closing Disclosure
      </p>

      <DocField label="Borrower" value={doc.borrower_name} />
      <DocField label="Loan Amount" value={formatCurrency(doc.loan_amount)} />
      <DocField
        label="Interest Rate"
        value={doc.interest_rate}
        highlight={badge === "modified"}
      />
      <DocField label="Closing Date" value={doc.closing_date} />
      <DocField label="Lender" value={doc.lender_name} />

      <HashPreview hash={hash} />

      {selected && (
        <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#E8503A] flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </span>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Drop zone
// ---------------------------------------------------------------------------

interface DropZoneProps {
  onFile: (f: File) => void;
  isDragging: boolean;
  onDragEnter: (e: DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: DragEvent<HTMLDivElement>) => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  uploadedFile: File | null;
}

function DropZone({
  onFile,
  isDragging,
  onDragEnter,
  onDragLeave,
  onDrop,
  uploadedFile,
}: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      onDragEnter={onDragEnter}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      className={cn(
        "relative border-2 border-dashed rounded-xl px-5 py-4 text-center cursor-pointer transition-all duration-200",
        isDragging
          ? "border-[#E8503A] bg-[#E8503A]/5"
          : uploadedFile
            ? "border-emerald-500/40 bg-emerald-950/20"
            : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/20",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.json,.txt"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
      {uploadedFile ? (
        <div className="flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="text-emerald-400 text-xs font-medium truncate max-w-xs">
            {uploadedFile.name}
          </p>
        </div>
      ) : (
        <>
          <Upload
            className={cn(
              "w-4 h-4 mx-auto mb-1.5",
              isDragging ? "text-[#E8503A]" : "text-zinc-700",
            )}
          />
          <p className="text-zinc-600 text-xs">
            Drop a PDF here or{" "}
            <span className="text-zinc-400 underline underline-offset-2">browse</span> to upload
            your own document
          </p>
          <p className="text-zinc-800 text-[10px] mt-1">File is hashed locally — never stored</p>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Payload preview panel
// ---------------------------------------------------------------------------

function PayloadPanel({ doc, hash }: { doc: DocRecord; hash: string }) {
  const payload = {
    artifact_hash: hash ? `sha256:${hash}` : "computing…",
    document_type: doc.document_type,
    metadata: {
      borrower_name: doc.borrower_name,
      loan_amount: doc.loan_amount,
      interest_rate: doc.interest_rate,
      closing_date: doc.closing_date,
      lender_name: doc.lender_name,
      loan_number: doc.loan_number,
    },
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 h-full">
      <p
        className="text-[9px] uppercase tracking-widest text-zinc-600 mb-3"
        style={{ fontFamily: "var(--font-space-mono, monospace)" }}
      >
        POST /api/v1/documents
      </p>
      <pre
        className="text-[11px] text-zinc-300 whitespace-pre-wrap leading-relaxed overflow-auto max-h-56"
        style={{ fontFamily: "var(--font-space-mono, monospace)" }}
      >
        {JSON.stringify(payload, null, 2)}
      </pre>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Generic response panel (for ingest)
// ---------------------------------------------------------------------------

function IngestResponsePanel({ state }: { state: ApiStepState }) {
  if (state.status === "idle") {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 flex items-center justify-center min-h-[140px]">
        <p
          className="text-zinc-700 text-xs"
          style={{ fontFamily: "var(--font-space-mono, monospace)" }}
        >
          waiting…
        </p>
      </div>
    );
  }

  if (state.status === "loading") {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 flex flex-col items-center justify-center gap-2.5 min-h-[140px]">
        <Loader2 className="w-5 h-5 text-[#E8503A] animate-spin" />
        <p
          className="text-zinc-500 text-xs animate-pulse"
          style={{ fontFamily: "var(--font-space-mono, monospace)" }}
        >
          ingesting…
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 h-full">
      <div className="flex items-center justify-between mb-3">
        <p
          className="text-[9px] uppercase tracking-widest text-zinc-600"
          style={{ fontFamily: "var(--font-space-mono, monospace)" }}
        >
          {state.status === "error" ? "Error" : "Response"}
        </p>
        {state.simulated && (
          <span
            className="text-[9px] uppercase tracking-widest text-zinc-600 bg-zinc-800/60 px-1.5 py-0.5 rounded"
            style={{ fontFamily: "var(--font-space-mono, monospace)" }}
          >
            simulated
          </span>
        )}
      </div>
      <pre
        className={cn(
          "text-[11px] whitespace-pre-wrap leading-relaxed overflow-auto max-h-56",
          state.status === "error" ? "text-red-300" : "text-zinc-300",
        )}
        style={{ fontFamily: "var(--font-space-mono, monospace)" }}
      >
        {JSON.stringify(state.response, null, 2)}
      </pre>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Receipt panel (ANCHOR step)
// ---------------------------------------------------------------------------

function ReceiptPanel({ state }: { state: ApiStepState }) {
  if (state.status === "loading") {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 text-[#E8503A] animate-spin" />
        <p
          className="text-zinc-500 text-sm animate-pulse"
          style={{ fontFamily: "var(--font-space-mono, monospace)" }}
        >
          anchoring document…
        </p>
      </div>
    );
  }

  if (!state.response) return null;

  const data = state.response;
  const entries = Object.entries(data).filter(([k]) => k !== "_simulated");

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/40">
        <div className="flex items-center gap-2.5">
          <Shield className="w-4 h-4 text-[#E8503A]" />
          <span className="text-sm font-semibold text-zinc-100">Integrity Receipt</span>
        </div>
        <div className="flex items-center gap-2">
          {state.simulated && (
            <span
              className="text-[9px] uppercase tracking-widest text-zinc-600 bg-zinc-800/60 px-1.5 py-0.5 rounded"
              style={{ fontFamily: "var(--font-space-mono, monospace)" }}
            >
              simulated
            </span>
          )}
          <span
            className="text-emerald-400 text-[10px] flex items-center gap-1"
            style={{ fontFamily: "var(--font-space-mono, monospace)" }}
          >
            <CheckCircle2 className="w-3 h-3" />
            anchored
          </span>
        </div>
      </div>

      {/* Field rows */}
      <div className="divide-y divide-zinc-800/50">
        {entries.map(([key, value]) => (
          <div key={key} className="px-5 py-3 flex gap-4 items-start">
            <span
              className="text-zinc-600 text-[10px] uppercase tracking-wider shrink-0 w-28 pt-0.5"
              style={{ fontFamily: "var(--font-space-mono, monospace)" }}
            >
              {key}
            </span>
            <code
              className="text-zinc-300 text-[11px] leading-relaxed break-all flex-1"
              style={{ fontFamily: "var(--font-space-mono, monospace)" }}
            >
              {typeof value === "object" ? JSON.stringify(value) : String(value)}
            </code>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Verify result panel
// ---------------------------------------------------------------------------

function VerifyResult({
  state,
  choice,
}: {
  state: ApiStepState;
  choice: DocChoice | null;
}) {
  if (state.status === "loading") {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-10 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-7 h-7 text-[#E8503A] animate-spin" />
        <p
          className="text-zinc-500 text-sm animate-pulse"
          style={{ fontFamily: "var(--font-space-mono, monospace)" }}
        >
          verifying integrity…
        </p>
      </div>
    );
  }

  if (!state.response) return null;

  const data = state.response;
  const verified = data.verified === true || data.match === true || data.status === "verified";
  const excluded = new Set(["_simulated", "verified", "match"]);
  const entries = Object.entries(data).filter(([k]) => !excluded.has(k));
  const mismatchDetail = typeof data.mismatch_detail === "string" ? data.mismatch_detail : null;
  const submittedHash = typeof data.submitted_hash === "string" ? data.submitted_hash : null;
  const anchoredHash = typeof data.anchored_hash === "string" ? data.anchored_hash : null;
  const hashEntryKeys = new Set(["mismatch_detail", "submitted_hash", "anchored_hash"]);
  const remainingEntries = entries.filter(([k]) => !hashEntryKeys.has(k));

  if (verified) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 overflow-hidden">
        <div className="px-6 py-5 border-b border-emerald-500/20 flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-emerald-400 font-semibold text-base">
              Document Integrity Confirmed
            </h3>
            <p className="text-emerald-600/80 text-sm mt-0.5">
              The submitted document matches the anchored record exactly.
            </p>
          </div>
          {state.simulated && (
            <span
              className="text-[9px] uppercase tracking-widest text-zinc-600 bg-zinc-800/50 px-1.5 py-0.5 rounded self-start shrink-0"
              style={{ fontFamily: "var(--font-space-mono, monospace)" }}
            >
              simulated
            </span>
          )}
        </div>
        <div className="divide-y divide-emerald-900/30">
          {remainingEntries.map(([key, value]) => (
            <div key={key} className="px-6 py-2.5 flex gap-4 items-start">
              <span
                className="text-emerald-800 text-[10px] uppercase tracking-wider shrink-0 w-28 pt-0.5"
                style={{ fontFamily: "var(--font-space-mono, monospace)" }}
              >
                {key}
              </span>
              <code
                className="text-emerald-300 text-[11px] leading-relaxed break-all flex-1"
                style={{ fontFamily: "var(--font-space-mono, monospace)" }}
              >
                {typeof value === "object" ? JSON.stringify(value) : String(value)}
              </code>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Failure
  return (
    <div className="rounded-2xl border border-[#E8503A]/40 bg-[#E8503A]/5 overflow-hidden">
      <div className="px-6 py-5 border-b border-[#E8503A]/20 flex items-start gap-3">
        <ShieldX className="w-6 h-6 text-[#E8503A] shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-[#E8503A] font-semibold text-base">Integrity Failure Detected</h3>
          <p className="text-[#E8503A]/60 text-sm mt-0.5">
            The document has been altered since it was anchored.
          </p>
        </div>
        {state.simulated && (
          <span
            className="text-[9px] uppercase tracking-widest text-zinc-600 bg-zinc-800/50 px-1.5 py-0.5 rounded self-start shrink-0"
            style={{ fontFamily: "var(--font-space-mono, monospace)" }}
          >
            simulated
          </span>
        )}
      </div>

      <div className="px-6 py-4 space-y-4">
        {mismatchDetail && (
          <div className="rounded-lg bg-[#E8503A]/10 border border-[#E8503A]/20 px-4 py-3">
            <p
              className="text-[#E8503A] text-xs leading-relaxed"
              style={{ fontFamily: "var(--font-space-mono, monospace)" }}
            >
              {mismatchDetail}
            </p>
          </div>
        )}

        {(submittedHash || anchoredHash) && (
          <div className="space-y-2">
            {submittedHash && (
              <div className="flex gap-3 items-start">
                <span
                  className="text-zinc-600 text-[10px] uppercase tracking-wider shrink-0 w-28 pt-0.5"
                  style={{ fontFamily: "var(--font-space-mono, monospace)" }}
                >
                  submitted
                </span>
                <code
                  className="text-zinc-400 text-[11px] break-all flex-1"
                  style={{ fontFamily: "var(--font-space-mono, monospace)" }}
                >
                  {submittedHash}
                </code>
              </div>
            )}
            {anchoredHash && (
              <div className="flex gap-3 items-start">
                <span
                  className="text-[#E8503A] text-[10px] uppercase tracking-wider shrink-0 w-28 pt-0.5"
                  style={{ fontFamily: "var(--font-space-mono, monospace)" }}
                >
                  anchored
                </span>
                <code
                  className="text-[#E8503A] text-[11px] break-all flex-1"
                  style={{ fontFamily: "var(--font-space-mono, monospace)" }}
                >
                  {anchoredHash}
                </code>
              </div>
            )}
          </div>
        )}

        {remainingEntries.map(([key, value]) => (
          <div key={key} className="flex gap-3 items-start">
            <span
              className="text-zinc-600 text-[10px] uppercase tracking-wider shrink-0 w-28 pt-0.5"
              style={{ fontFamily: "var(--font-space-mono, monospace)" }}
            >
              {key}
            </span>
            <code
              className="text-zinc-400 text-[11px] break-all flex-1"
              style={{ fontFamily: "var(--font-space-mono, monospace)" }}
            >
              {typeof value === "object" ? JSON.stringify(value) : String(value)}
            </code>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function DemoPlayground() {
  const [step, setStep] = useState<Step>("select");
  const [choice, setChoice] = useState<DocChoice | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hashes, setHashes] = useState({ original: "", modified: "", custom: "", selected: "" });

  const [ingestState, setIngestState] = useState<ApiStepState>(EMPTY_STEP);
  const [anchorState, setAnchorState] = useState<ApiStepState>(EMPTY_STEP);
  const [verifyState, setVerifyState] = useState<ApiStepState>(EMPTY_STEP);

  // Compute stable hashes for pre-loaded docs on mount
  useEffect(() => {
    Promise.all([
      sha256hex(JSON.stringify(ORIGINAL_DOC)),
      sha256hex(JSON.stringify(MODIFIED_DOC)),
    ]).then(([original, modified]) => {
      setHashes((h) => ({ ...h, original, modified }));
    });
  }, []);

  // When a custom file is selected, compute its hash
  useEffect(() => {
    if (!uploadedFile) return;
    uploadedFile.arrayBuffer().then((buf) =>
      sha256hexFromBuffer(buf).then((hash) => {
        setHashes((h) => ({ ...h, custom: hash, selected: hash }));
      }),
    );
  }, [uploadedFile]);

  // Keep selected hash in sync with the current choice
  useEffect(() => {
    if (choice === "original") setHashes((h) => ({ ...h, selected: h.original }));
    else if (choice === "modified") setHashes((h) => ({ ...h, selected: h.modified }));
    // custom: handled by the uploadedFile effect above
  }, [choice, hashes.original, hashes.modified]);

  const selectedDoc: DocRecord =
    choice === "modified" ? ({ ...MODIFIED_DOC } as DocRecord) : ({ ...ORIGINAL_DOC } as DocRecord);

  // Drag-and-drop handlers
  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setUploadedFile(file);
      setChoice("custom");
    }
  }, []);

  const handleFileUpload = useCallback((f: File) => {
    setUploadedFile(f);
    setChoice("custom");
  }, []);

  const canStart = !!choice && !!hashes.selected;

  const runDemo = async () => {
    if (!canStart) return;

    const selectedHash = hashes.selected;
    const originalHash = hashes.original;

    // ---- INGEST ----
    setStep("ingest");
    setIngestState({ status: "loading", response: null, simulated: false });

    let ingestData: Record<string, unknown>;
    let ingestSim = false;

    try {
      const { data, needsSim } = await callProxy("ingest", {
        artifact_hash: `sha256:${selectedHash}`,
        document_type: selectedDoc.document_type,
        metadata: {
          borrower_name: selectedDoc.borrower_name,
          loan_amount: selectedDoc.loan_amount,
          interest_rate: selectedDoc.interest_rate,
          closing_date: selectedDoc.closing_date,
          lender_name: selectedDoc.lender_name,
          loan_number: selectedDoc.loan_number,
        },
      });
      if (needsSim) {
        ingestData = makeIngestSim(selectedHash);
        ingestSim = true;
      } else {
        ingestData = data;
      }
    } catch {
      ingestData = makeIngestSim(selectedHash);
      ingestSim = true;
    }

    setIngestState({ status: "done", response: ingestData, simulated: ingestSim });

    await new Promise((r) => setTimeout(r, 1400));

    // ---- ANCHOR ----
    setStep("anchor");
    setAnchorState({ status: "loading", response: null, simulated: false });

    const docId =
      typeof ingestData.id === "string" ? ingestData.id : `doc_${selectedHash.slice(0, 12)}`;

    let anchorData: Record<string, unknown>;
    let anchorSim = false;

    try {
      const { data, needsSim } = await callProxy("anchor", {
        artifact_hash: `sha256:${selectedHash}`,
        document_id: docId,
      });
      if (needsSim) {
        anchorData = makeAnchorSim(selectedHash);
        anchorSim = true;
      } else {
        anchorData = data;
      }
    } catch {
      anchorData = makeAnchorSim(selectedHash);
      anchorSim = true;
    }

    setAnchorState({ status: "done", response: anchorData, simulated: anchorSim });

    await new Promise((r) => setTimeout(r, 1400));

    // ---- VERIFY ----
    setStep("verify");
    setVerifyState({ status: "loading", response: null, simulated: false });

    const receiptId =
      typeof anchorData.receipt_id === "string"
        ? anchorData.receipt_id
        : `rcpt_${selectedHash.slice(0, 12)}`;

    // Always verify using the ORIGINAL document's hash.
    // - If user chose "original": hashes match → PASS
    // - If user chose "modified" or "custom": hashes differ → FAIL
    // Custom uploads verify against themselves (self-anchored → always PASS)
    const verifyHash = choice === "custom" ? selectedHash : originalHash;
    const isVerified = choice === "original" || choice === "custom";

    let verifyData: Record<string, unknown>;
    let verifySim = false;

    try {
      const { data, needsSim } = await callProxy("verify", {
        receipt_id: receiptId,
        artifact_hash: `sha256:${verifyHash}`,
      });
      if (needsSim) {
        verifyData = makeVerifySim(isVerified, verifyHash, selectedHash, receiptId);
        verifySim = true;
      } else {
        verifyData = data;
      }
    } catch {
      verifyData = makeVerifySim(isVerified, verifyHash, selectedHash, receiptId);
      verifySim = true;
    }

    setVerifyState({ status: "done", response: verifyData, simulated: verifySim });
  };

  const reset = () => {
    setStep("select");
    setChoice(null);
    setUploadedFile(null);
    setHashes((h) => ({ ...h, selected: "", custom: "" }));
    setIngestState(EMPTY_STEP);
    setAnchorState(EMPTY_STEP);
    setVerifyState(EMPTY_STEP);
  };

  return (
    <div
      className="min-h-screen bg-[#1C1C1E] text-white"
      style={{ fontFamily: "var(--font-dm-sans, system-ui, sans-serif)" }}
    >
      {/* ── Header ─────────────────────────────────────── */}
      <header className="border-b border-zinc-800/60 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[#E8503A] font-bold text-lg tracking-tight">TrustSignal</span>
            <span
              className="text-zinc-700 text-xs hidden sm:block"
              style={{ fontFamily: "var(--font-space-mono, monospace)" }}
            >
              / integrity-demo
            </span>
          </div>
          {step !== "select" && (
            <button
              onClick={reset}
              className="flex items-center gap-1.5 text-zinc-600 hover:text-zinc-300 text-xs transition-colors"
              type="button"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* ── Step tracker ───────────────────────────────── */}
        <StepTracker current={step} />

        {/* ── Page title ─────────────────────────────────── */}
        <div className="mt-8 mb-6 text-center">
          {step === "select" && (
            <>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
                Select a document to verify
              </h1>
              <p className="text-zinc-500 mt-2 text-sm max-w-lg mx-auto leading-relaxed">
                Two mortgage documents — identical except for one field. Select one and watch
                TrustSignal anchor it and test its integrity.
              </p>
            </>
          )}
          {step === "ingest" && (
            <>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
                Ingesting document
              </h1>
              <p className="text-zinc-500 mt-2 text-sm">
                Sending document payload to TrustSignal…
              </p>
            </>
          )}
          {step === "anchor" && (
            <>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
                Anchoring document
              </h1>
              <p className="text-zinc-500 mt-2 text-sm">
                Creating a tamper-evident receipt for this document.
              </p>
            </>
          )}
          {step === "verify" && (
            <>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
                Verifying integrity
              </h1>
              <p className="text-zinc-500 mt-2 text-sm">
                Checking the original document hash against the anchored receipt.
              </p>
            </>
          )}
        </div>

        {/* ── Step content ───────────────────────────────── */}

        {/* 01 SELECT */}
        {step === "select" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DocumentCard
                title="Original"
                badge="original"
                doc={{ ...ORIGINAL_DOC } as DocRecord}
                hash={hashes.original}
                selected={choice === "original"}
                onSelect={() => setChoice("original")}
              />
              <DocumentCard
                title="Modified"
                badge="modified"
                doc={{ ...MODIFIED_DOC } as DocRecord}
                hash={hashes.modified}
                selected={choice === "modified"}
                onSelect={() => setChoice("modified")}
              />
            </div>

            <DropZone
              onFile={handleFileUpload}
              isDragging={isDragging}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              uploadedFile={uploadedFile}
            />

            {choice === "custom" && uploadedFile && (
              <div
                className="flex items-center gap-2 text-zinc-500 text-xs px-1"
                style={{ fontFamily: "var(--font-space-mono, monospace)" }}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                Custom document selected — integrity check will verify file hash against receipt
              </div>
            )}

            <button
              onClick={runDemo}
              disabled={!canStart}
              className={cn(
                "w-full rounded-xl py-3.5 px-6 font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200",
                canStart
                  ? "bg-[#E8503A] hover:bg-[#d44633] text-white shadow-[0_4px_24px_#E8503A30]"
                  : "bg-zinc-800/50 text-zinc-600 cursor-not-allowed",
              )}
              type="button"
            >
              Begin Integrity Check
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 02 INGEST */}
        {step === "ingest" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p
                className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2 px-1"
                style={{ fontFamily: "var(--font-space-mono, monospace)" }}
              >
                Payload
              </p>
              <PayloadPanel doc={selectedDoc} hash={hashes.selected} />
            </div>
            <div>
              <p
                className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2 px-1"
                style={{ fontFamily: "var(--font-space-mono, monospace)" }}
              >
                Response
              </p>
              <IngestResponsePanel state={ingestState} />
            </div>
          </div>
        )}

        {/* 03 ANCHOR */}
        {step === "anchor" && (
          <div>
            {/* Show the ingest result as a subtle summary */}
            {ingestState.response && (
              <div className="mb-4 rounded-xl border border-zinc-800/50 bg-zinc-900/30 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-zinc-500 text-xs">Ingestion confirmed</span>
                  {typeof ingestState.response.id === "string" && (
                    <code
                      className="text-zinc-600 text-[11px]"
                      style={{ fontFamily: "var(--font-space-mono, monospace)" }}
                    >
                      {ingestState.response.id}
                    </code>
                  )}
                </div>
              </div>
            )}
            <ReceiptPanel state={anchorState} />
          </div>
        )}

        {/* 04 VERIFY */}
        {step === "verify" && (
          <div>
            {/* Receipt summary */}
            {anchorState.response && (
              <div className="mb-4 rounded-xl border border-zinc-800/50 bg-zinc-900/30 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span className="text-zinc-500 text-xs">Receipt</span>
                  {typeof anchorState.response.receipt_id === "string" && (
                    <code
                      className="text-zinc-600 text-[11px]"
                      style={{ fontFamily: "var(--font-space-mono, monospace)" }}
                    >
                      {anchorState.response.receipt_id}
                    </code>
                  )}
                </div>
              </div>
            )}
            <VerifyResult state={verifyState} choice={choice} />

            {/* Reset button after verification is done */}
            {verifyState.status === "done" && (
              <button
                onClick={reset}
                className="mt-6 w-full rounded-xl border border-zinc-800 py-3 px-6 font-medium text-sm text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-all duration-200 flex items-center justify-center gap-2"
                type="button"
              >
                <RotateCcw className="w-4 h-4" />
                Run Another Demo
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="border-t border-zinc-800/40 mt-12 px-4 py-6">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-zinc-700 text-xs">
            © {new Date().getFullYear()} TrustSignal. Evidence integrity infrastructure.
          </p>
          <a
            href="https://trustsignal.dev"
            className="text-zinc-700 hover:text-[#E8503A] text-xs transition-colors"
            target="_blank"
            rel="noreferrer"
          >
            trustsignal.dev →
          </a>
        </div>
      </footer>
    </div>
  );
}
