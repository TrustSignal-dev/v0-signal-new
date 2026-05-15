"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type ConsistencyResult = {
  integrityVerified: boolean
  reason:
    | "match"
    | "artifact_mismatch"
    | "missing_hash"
    | "invalid_receipt"
    | "verification_failed"
  method: "local_hash_compare" | "receipt_verify_api"
  receiptId: string | null
  storedArtifactHash: string | null
  presentedArtifactHash: string | null
  errorMessage: string | null
}

type ParsedReceiptInput = {
  receiptId: string | null
  storedHash: string | null
  artifactReference: string | null
  reason: "missing_hash" | "invalid_receipt" | null
}

function normalizeHash(value: string | null | undefined) {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.toLowerCase().startsWith("sha256:") ? trimmed.toLowerCase() : `sha256:${trimmed.toLowerCase()}`
}

function extractStoredHash(receiptInput: string): ParsedReceiptInput {
  const normalizedInput = receiptInput.trim()
  if (!normalizedInput) {
    return { receiptId: null, storedHash: null, artifactReference: null, reason: "missing_hash" }
  }

  try {
    const parsed = JSON.parse(normalizedInput) as Record<string, unknown>
    const receiptId =
      (typeof parsed.receipt_id === "string" && parsed.receipt_id) ||
      (typeof parsed.receiptId === "string" && parsed.receiptId) ||
      null
    const nestedArtifact =
      parsed.artifact && typeof parsed.artifact === "object"
        ? (parsed.artifact as Record<string, unknown>)
        : null

    const artifactReference =
      (typeof parsed.artifact_reference === "string" && parsed.artifact_reference) ||
      (typeof parsed.artifactReference === "string" && parsed.artifactReference) ||
      (nestedArtifact && typeof nestedArtifact.artifact_reference === "string" && nestedArtifact.artifact_reference) ||
      (nestedArtifact && typeof nestedArtifact.artifactReference === "string" && nestedArtifact.artifactReference) ||
      null

    const candidate =
      (typeof parsed.stored_artifact_hash === "string" && parsed.stored_artifact_hash) ||
      (typeof parsed.artifact_hash === "string" && parsed.artifact_hash) ||
      (typeof parsed.artifactHash === "string" && parsed.artifactHash) ||
      (nestedArtifact && typeof nestedArtifact.artifact_hash === "string" && nestedArtifact.artifact_hash) ||
      (nestedArtifact && typeof nestedArtifact.artifactHash === "string" && nestedArtifact.artifactHash) ||
      null

    return {
      receiptId,
      storedHash: normalizeHash(candidate),
      artifactReference,
      reason: candidate ? null : "missing_hash",
    }
  } catch {
    const directHash = normalizeHash(normalizedInput)
    return {
      receiptId: null,
      storedHash: directHash,
      artifactReference: null,
      reason: directHash ? null : "invalid_receipt",
    }
  }
}

async function sha256ForFile(file: File) {
  const buffer = await file.arrayBuffer()
  const digest = await crypto.subtle.digest("SHA-256", buffer)
  const hex = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")

  return `sha256:${hex}`
}

export default function CommandCenterSection() {
  const [receiptInput, setReceiptInput] = useState("")
  const [verificationApiKey, setVerificationApiKey] = useState("")
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const [isCheckingConsistency, setIsCheckingConsistency] = useState(false)
  const [consistencyResult, setConsistencyResult] = useState<ConsistencyResult | null>(null)

  async function handleDocumentSelection(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    if (!file) {
      setSelectedFileName(null)
      setConsistencyResult(null)
      return
    }

    setSelectedFileName(file.name)
    setIsCheckingConsistency(true)

    const parsedReceipt = extractStoredHash(receiptInput)
    const { receiptId, storedHash, reason, artifactReference } = parsedReceipt
    if (!storedHash) {
      setConsistencyResult({
        integrityVerified: false,
        reason: reason ?? "missing_hash",
        method: "local_hash_compare",
        receiptId,
        storedArtifactHash: null,
        presentedArtifactHash: null,
        errorMessage: null,
      })
      setIsCheckingConsistency(false)
      return
    }

    const presentedHash = await sha256ForFile(file)

    if (receiptId) {
      const response = await fetch(`/api/receipts/${encodeURIComponent(receiptId)}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artifactHash: presentedHash,
          artifactReference,
          apiKey: verificationApiKey.trim() || undefined,
        }),
      })

      const data = (await response.json().catch(() => ({}))) as Record<string, unknown>
      if (response.ok) {
        const integrityVerified = data.integrity_verified === true
        const remoteStoredHash = normalizeHash(
          typeof data.stored_artifact_hash === "string" ? data.stored_artifact_hash : null,
        )
        const remotePresentedHash = normalizeHash(
          typeof data.presented_artifact_hash === "string" ? data.presented_artifact_hash : null,
        )

        setConsistencyResult({
          integrityVerified,
          reason: integrityVerified ? "match" : "artifact_mismatch",
          method: "receipt_verify_api",
          receiptId,
          storedArtifactHash: remoteStoredHash ?? storedHash,
          presentedArtifactHash: remotePresentedHash ?? presentedHash,
          errorMessage: null,
        })
        setIsCheckingConsistency(false)
        return
      }

      const remoteError =
        (typeof data.error === "string" && data.error) ||
        (typeof data.message === "string" && data.message) ||
        "Receipt verification request failed"

      setConsistencyResult({
        integrityVerified: false,
        reason: "verification_failed",
        method: "receipt_verify_api",
        receiptId,
        storedArtifactHash: storedHash,
        presentedArtifactHash: presentedHash,
        errorMessage: remoteError,
      })
      setIsCheckingConsistency(false)
      return
    }

    setConsistencyResult({
      integrityVerified: storedHash === presentedHash,
      reason: storedHash === presentedHash ? "match" : "artifact_mismatch",
      method: "local_hash_compare",
      receiptId: null,
      storedArtifactHash: storedHash,
      presentedArtifactHash: presentedHash,
      errorMessage: null,
    })
    setIsCheckingConsistency(false)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Agent Status Overview */}
        <Card className="lg:col-span-4 bg-neutral-900 border-neutral-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">RECEIPT COVERAGE</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white font-mono">190</div>
                <div className="text-xs text-neutral-500">Signed Today</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white font-mono">990</div>
                <div className="text-xs text-neutral-500">Queued Review</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white font-mono">290</div>
                <div className="text-xs text-neutral-500">Flagged Drift</div>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { id: "ORG-104", name: "GRC Evidence Sync", status: "active" },
                { id: "ORG-231", name: "Drata Daily Snapshot", status: "standby" },
                { id: "ORG-188", name: "GitHub Control Export", status: "active" },
                { id: "ORG-319", name: "HRIS Access Review", status: "compromised" },
              ].map((source) => (
                <div
                  key={source.id}
                  className="flex items-center justify-between p-2 bg-neutral-800 rounded hover:bg-neutral-700 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        source.status === "active"
                          ? "bg-white"
                          : source.status === "standby"
                            ? "bg-neutral-500"
                            : "bg-red-500"
                      }`}
                    ></div>
                    <div>
                      <div className="text-xs text-white font-mono">{source.id}</div>
                      <div className="text-xs text-neutral-500">{source.name}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card className="lg:col-span-4 bg-neutral-900 border-neutral-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">VERIFICATION EVENT LOG</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {[
                {
                  time: "25/06/2025 09:29",
                  agent: "github-audit-export",
                  action: "matched signed receipt for",
                  location: "Access Review",
                  target: "rcpt_01hzg7",
                },
                {
                  time: "25/06/2025 08:12",
                  agent: "grc-evidence-sync",
                  action: "ingested artifact for",
                  location: "Vendor Security Policy",
                  target: null,
                },
                {
                  time: "24/06/2025 22:55",
                  agent: "okta-review-job",
                  action: "flagged drift on",
                  location: "Privileged Access Export",
                  target: null,
                },
                {
                  time: "24/06/2025 21:33",
                  agent: "drata-control-run",
                  action: "queued verification for",
                  location: "Change Management Snapshot",
                  target: null,
                },
                {
                  time: "24/06/2025 19:45",
                  agent: "manual-review-console",
                  action: "rejected mismatched evidence for",
                  location: "Endpoint Hardening Proof",
                  target: "rcpt_01hy2c",
                },
              ].map((log, index) => (
                <div
                  key={index}
                  className="text-xs border-l-2 border-orange-500 pl-3 hover:bg-neutral-800 p-2 rounded transition-colors"
                >
                  <div className="text-neutral-500 font-mono">{log.time}</div>
                  <div className="text-white">
                    Source <span className="text-orange-500 font-mono">{log.agent}</span> {log.action}{" "}
                    <span className="text-white font-mono">{log.location}</span>
                    {log.target && (
                      <span>
                        {" "}
                        with reference <span className="text-orange-500 font-mono">{log.target}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Encrypted Chat Activity */}
        <Card className="lg:col-span-4 bg-neutral-900 border-neutral-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">SIGNING STREAM</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {/* Wireframe Sphere */}
            <div className="relative w-32 h-32 mb-4">
              <div className="absolute inset-0 border-2 border-white rounded-full opacity-60 animate-pulse"></div>
              <div className="absolute inset-2 border border-white rounded-full opacity-40"></div>
              <div className="absolute inset-4 border border-white rounded-full opacity-20"></div>
              {/* Grid lines */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-px bg-white opacity-30"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-px h-full bg-white opacity-30"></div>
              </div>
            </div>

            <div className="text-xs text-neutral-500 space-y-1 w-full font-mono">
              <div className="flex justify-between">
                <span># 2025-06-17 14:23 UTC</span>
              </div>
              <div className="text-white">{"> [SRC:gh0stfire] ::: INIT >> ^^^ loading receipt channel"}</div>
              <div className="text-orange-500">{"> CH#2 | 1231.9082464.500...xR3"}</div>
              <div className="text-white">{"> SIGNATURE VERIFIED"}</div>
              <div className="text-neutral-400">
                {'> MSG >> "...receipt minted... awaiting verifier acknowledgment"'}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-12 bg-neutral-900 border-neutral-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
              ARTIFACT RECEIPT CONSISTENCY
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-neutral-400">
              Compare the current document against the receipted artifact hash before a reviewer relies on it.
              Paste a receipt JSON blob (preferred) or stored hash, then upload the current document.
            </p>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.22em] text-neutral-500">
                  Receipt JSON Or Stored Hash
                </span>
                <textarea
                  value={receiptInput}
                  onChange={(event) => {
                    setReceiptInput(event.target.value)
                    setConsistencyResult(null)
                  }}
                  placeholder='{"artifact_hash":"sha256:..."}'
                  className="min-h-36 w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-3 text-sm text-white outline-none transition-colors placeholder:text-neutral-500 focus:border-orange-500"
                />
              </label>

              <div className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-xs font-medium uppercase tracking-[0.22em] text-neutral-500">
                    Verify API Key (Optional)
                  </span>
                  <input
                    type="password"
                    value={verificationApiKey}
                    onChange={(event) => setVerificationApiKey(event.target.value)}
                    placeholder="tsk_live_..."
                    className="block w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-3 text-sm text-white outline-none transition-colors placeholder:text-neutral-500 focus:border-orange-500"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-medium uppercase tracking-[0.22em] text-neutral-500">
                    Current Document
                  </span>
                  <input
                    type="file"
                    onChange={handleDocumentSelection}
                    className="block w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-3 text-sm text-neutral-300 file:mr-4 file:rounded file:border-0 file:bg-orange-500 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-orange-600"
                  />
                </label>

                <div className="rounded border border-neutral-700 bg-neutral-800 p-4 text-sm text-neutral-300">
                  <div className="text-xs uppercase tracking-[0.22em] text-neutral-500">Selected Document</div>
                  <div className="mt-2 break-all text-white">{selectedFileName ?? "No document selected"}</div>
                </div>

                <div className="rounded border border-neutral-700 bg-neutral-800 p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-neutral-500">Consistency Status</div>
                  <div className="mt-3">
                    {isCheckingConsistency ? (
                      <span className="text-sm text-white">Computing current document hash...</span>
                    ) : consistencyResult ? (
                      <div className="space-y-3">
                        <div className="text-xs text-neutral-500 uppercase tracking-[0.2em]">
                          {consistencyResult.method === "receipt_verify_api"
                            ? "Checked via Receipt Verify API"
                            : "Checked via Local Hash Comparison"}
                        </div>
                        {consistencyResult.receiptId && (
                          <div className="text-xs text-neutral-400">
                            Receipt ID: <span className="font-mono text-white">{consistencyResult.receiptId}</span>
                          </div>
                        )}
                        <div
                          className={`inline-flex rounded px-2 py-1 text-xs font-medium uppercase tracking-[0.22em] ${
                            consistencyResult.integrityVerified
                              ? "bg-white/20 text-white"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {consistencyResult.integrityVerified ? "MATCH" : consistencyResult.reason}
                        </div>
                        {consistencyResult.errorMessage && (
                          <div className="text-xs text-red-400">{consistencyResult.errorMessage}</div>
                        )}
                        <div className="space-y-2 text-xs text-neutral-400">
                          <div>
                            <div className="uppercase tracking-[0.18em] text-neutral-500">Stored Artifact Hash</div>
                            <div className="mt-1 break-all font-mono text-white">
                              {consistencyResult.storedArtifactHash ?? "Unavailable"}
                            </div>
                          </div>
                          <div>
                            <div className="uppercase tracking-[0.18em] text-neutral-500">Presented Artifact Hash</div>
                            <div className="mt-1 break-all font-mono text-white">
                              {consistencyResult.presentedArtifactHash ?? "Unavailable"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-neutral-400">
                        Waiting for receipt data and current document.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mission Activity Chart */}
        <Card className="lg:col-span-8 bg-neutral-900 border-neutral-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">VERIFICATION VOLUME</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 relative">
              {/* Chart Grid */}
              <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 opacity-20">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div key={i} className="border border-neutral-700"></div>
                ))}
              </div>

              {/* Chart Line */}
              <svg className="absolute inset-0 w-full h-full">
                <polyline
                  points="0,120 50,100 100,110 150,90 200,95 250,85 300,100 350,80"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2"
                />
                <polyline
                  points="0,140 50,135 100,130 150,125 200,130 250,135 300,125 350,120"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              </svg>

              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-neutral-500 -ml-5 font-mono">
                <span>500</span>
                <span>400</span>
                <span>300</span>
                <span>200</span>
              </div>

              {/* X-axis labels */}
              <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-neutral-500 -mb-6 font-mono">
                <span>Jan 28, 2025</span>
                <span>Feb 28, 2025</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mission Information */}
        <Card className="lg:col-span-4 bg-neutral-900 border-neutral-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">INTEGRITY SUMMARY</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-xs text-white font-medium">Verified Evidence</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">High-risk controls</span>
                    <span className="text-white font-bold font-mono">190</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Medium-risk controls</span>
                    <span className="text-white font-bold font-mono">426</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Low-risk controls</span>
                    <span className="text-white font-bold font-mono">920</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-red-500 font-medium">Integrity Alerts</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">High severity</span>
                    <span className="text-white font-bold font-mono">190</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Medium severity</span>
                    <span className="text-white font-bold font-mono">426</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Low severity</span>
                    <span className="text-white font-bold font-mono">920</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
