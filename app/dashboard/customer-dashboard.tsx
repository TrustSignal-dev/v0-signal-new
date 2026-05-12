'use client';

import { useState, useTransition } from 'react';
import { createApiKey, getUsage, listApiKeys, revokeApiKey, type CustomerApiKey, type UsageStat } from '@/lib/customer-data';

type ReceiptSummary = {
  receiptId: string;
  hash: string;
  timestamp: string;
  anchor: string;
  status: 'SECURE';
};

type VerificationSummary = {
  verdict: 'VERIFIED' | 'TAMPERED';
  hash: string;
  timestamp: string;
  anchor: string;
};

function pickString(data: Record<string, unknown>, keys: string[], fallback = '—') {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }
  return fallback;
}

function pickStringFromNested(
  root: Record<string, unknown>,
  nestedKey: string,
  keys: string[],
  fallback = '—',
) {
  const nested = root[nestedKey];
  if (!nested || typeof nested !== 'object') {
    return fallback;
  }
  return pickString(nested as Record<string, unknown>, keys, fallback);
}

function buildReceiptSummary(payload: Record<string, unknown>): ReceiptSummary {
  return {
    receiptId: pickString(payload, ['receipt_id', 'receiptId', 'id']),
    hash: pickString(payload, ['receipt_hash', 'receiptHash', 'artifact_hash', 'artifactHash']),
    timestamp: pickString(payload, ['created_at', 'createdAt', 'timestamp']),
    anchor:
      pickStringFromNested(payload, 'anchor', ['status', 'tx_hash', 'txHash'], '—') !== '—'
        ? pickStringFromNested(payload, 'anchor', ['status', 'tx_hash', 'txHash'])
        : pickString(payload, ['anchor', 'anchor_status', 'anchorStatus']),
    status: 'SECURE',
  };
}

function buildVerificationSummary(payload: Record<string, unknown>): VerificationSummary {
  const verified = payload.integrity_verified === true;
  return {
    verdict: verified ? 'VERIFIED' : 'TAMPERED',
    hash: pickString(payload, ['presented_artifact_hash', 'artifact_hash', 'artifactHash']),
    timestamp: pickString(payload, ['verified_at', 'verifiedAt', 'timestamp', 'created_at', 'createdAt']),
    anchor:
      pickStringFromNested(payload, 'anchor', ['status', 'tx_hash', 'txHash'], '—') !== '—'
        ? pickStringFromNested(payload, 'anchor', ['status', 'tx_hash', 'txHash'])
        : pickString(payload, ['anchor', 'anchor_status', 'anchorStatus']),
  };
}

export function CustomerDashboard({ user }: { user: { id: string; email: string } }) {
  const [keys, setKeys] = useState<CustomerApiKey[]>([]);
  const [usage, setUsage] = useState<UsageStat | null>(null);
  const [usageError, setUsageError] = useState<string | null>(null);
  const [newKeySecret, setNewKeySecret] = useState<string | null>(null);
  const [keyName, setKeyName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [generatedReceipt, setGeneratedReceipt] = useState<ReceiptSummary | null>(null);
  const [artifactHashForVerify, setArtifactHashForVerify] = useState<string | null>(null);
  const [verifyReceiptId, setVerifyReceiptId] = useState('');
  const [isVerifyingReceipt, setIsVerifyingReceipt] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationSummary | null>(null);

  function handleLoadKeys() {
    startTransition(async () => {
      const result = await listApiKeys();
      if ('error' in result) {
        setError(result.error);
      } else {
        setKeys(result.keys);
        setLoaded(true);
      }
    });
  }

  function handleLoadUsage() {
    startTransition(async () => {
      const result = await getUsage();
      if ('error' in result) {
        setUsageError(result.error);
      } else {
        setUsage(result);
      }
    });
  }


  function handleCreateKey(formData: FormData) {
    const name = (formData.get('keyName') as string)?.trim();
    if (!name) return;
    startTransition(async () => {
      const result = await createApiKey(name);
      if ('error' in result) {
        setError(result.error);
      } else {
        setNewKeySecret(result.secret);
        setKeyName('');
        handleLoadKeys();
      }
    });
  }

  function handleRevokeKey(keyId: string) {
    startTransition(async () => {
      const result = await revokeApiKey(keyId);
      if ('error' in result) {
        setError(result.error);
      } else {
        setKeys((prev) => prev.map((k) => k.id === keyId ? { ...k, revoked_at: new Date().toISOString() } : k));
      }
    });
  }

  async function handleGenerateReceipt() {
    if (!selectedFile) {
      setReceiptError('Please select a file first.');
      return;
    }

    setReceiptError(null);
    setGeneratedReceipt(null);
    setVerificationResult(null);
    setVerifyError(null);
    setIsGeneratingReceipt(true);

    try {
      const form = new FormData();
      form.append('file', selectedFile);

      const response = await fetch('/api/receipts/create', {
        method: 'POST',
        body: form,
      });

      const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
      if (!response.ok) {
        const message =
          (typeof payload.error === 'string' && payload.error) || 'Could not generate receipt.';
        setReceiptError(message);
        return;
      }

      const summary = buildReceiptSummary(payload);
      setGeneratedReceipt(summary);
      setArtifactHashForVerify(summary.hash !== '—' ? summary.hash : null);
      setVerifyReceiptId(summary.receiptId !== '—' ? summary.receiptId : '');
    } catch {
      setReceiptError('Could not generate receipt. Please try again.');
    } finally {
      setIsGeneratingReceipt(false);
    }
  }

  async function handleVerifyReceipt() {
    if (!verifyReceiptId.trim()) {
      setVerifyError('Please enter a receipt ID.');
      return;
    }

    if (!artifactHashForVerify || artifactHashForVerify === '—') {
      setVerifyError('Generate a receipt first so the dashboard has an artifact hash to verify.');
      return;
    }

    setIsVerifyingReceipt(true);
    setVerifyError(null);
    setVerificationResult(null);

    try {
      const response = await fetch(`/api/receipts/${encodeURIComponent(verifyReceiptId.trim())}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artifactHash: artifactHashForVerify,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
      if (!response.ok) {
        const message =
          (typeof payload.error === 'string' && payload.error) || 'Receipt verification failed.';
        setVerifyError(message);
        return;
      }

      setVerificationResult(buildVerificationSummary(payload));
    } catch {
      setVerifyError('Receipt verification failed. Please try again.');
    } finally {
      setIsVerifyingReceipt(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">API Keys</h1>
          <p className="mt-1 text-sm text-slate-600">{user.email}</p>
        </div>
        <form action="/auth/sign-out" method="post">
          <button
            type="submit"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Sign out
          </button>
        </form>
      </header>

      {/* Usage widget */}
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold">Monthly usage</h2>
            {usage ? (
              <p className="text-xs text-slate-500 mt-0.5 capitalize">{usage.plan} plan · resets {usage.resetAt ? new Date(usage.resetAt).toLocaleDateString() : '—'}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={handleLoadUsage}
            disabled={isPending}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            {usage ? 'Refresh' : 'Load usage'}
          </button>
        </div>
        {usageError ? (
          <p className="text-sm text-red-600">{usageError}</p>
        ) : usage ? (
          <div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-semibold text-slate-900">{usage.used.toLocaleString()}</span>
              <span className="text-sm text-slate-500 mb-1">
                {usage.limit !== null ? `/ ${usage.limit.toLocaleString()} verifications` : 'verifications (unlimited)'}
              </span>
            </div>
            {usage.limit !== null ? (
              <div className="mt-3">
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#E8503A] transition-all"
                    style={{ width: `${Math.min(100, (usage.used / usage.limit) * 100).toFixed(1)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {usage.remaining !== null ? `${usage.remaining.toLocaleString()} remaining this month` : ''}
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-slate-400">Load your usage stats above.</p>
        )}
      </section>


      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {newKeySecret ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm space-y-2">
          <p className="font-semibold text-emerald-800">New API key created — copy it now, it will not be shown again.</p>
          <code className="block break-all rounded bg-emerald-100 px-3 py-2 font-mono text-xs text-emerald-900">
            {newKeySecret}
          </code>
          <button
            type="button"
            onClick={() => setNewKeySecret(null)}
            className="text-xs text-emerald-700 underline"
          >
            I&apos;ve saved it
          </button>
        </div>
      ) : null}

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold">Create API key</h2>
        <form action={handleCreateKey} className="mt-4 flex gap-3">
          <input
            name="keyName"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            placeholder="Key name (e.g. CI pipeline)"
            className="flex-1 rounded-2xl border border-slate-300 px-4 py-2.5 text-sm"
          />
          <button
            type="submit"
            disabled={isPending || !keyName.trim()}
            className="rounded-full bg-[#E8503A] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            Create
          </button>
        </form>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold">Document upload and receipt generation</h2>
        <p className="mt-1 text-sm text-slate-500">
          Upload a document to mint a receipt via the TrustSignal API.
        </p>

        <div className="mt-4 space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Document
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt,.csv,.json,.xml,.md"
              onChange={(event) => {
                setSelectedFile(event.target.files?.[0] ?? null);
                setReceiptError(null);
              }}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700"
            />
          </label>

          <button
            type="button"
            onClick={handleGenerateReceipt}
            disabled={isGeneratingReceipt || !selectedFile}
            className="inline-flex items-center gap-2 rounded-full bg-[#E8503A] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isGeneratingReceipt ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Generating...
              </>
            ) : (
              'Generate Receipt'
            )}
          </button>

          {receiptError ? (
            <p className="text-sm text-red-600">{receiptError}</p>
          ) : null}

          {generatedReceipt ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 space-y-2">
              <div className="font-semibold">Receipt generated successfully</div>
              <div>Receipt ID: <span className="font-mono">{generatedReceipt.receiptId}</span></div>
              <div>Hash: <span className="font-mono break-all">{generatedReceipt.hash}</span></div>
              <div>Timestamp: {generatedReceipt.timestamp}</div>
              <div>Anchor: {generatedReceipt.anchor}</div>
              <div>Status: <span className="font-semibold">{generatedReceipt.status}</span></div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold">Receipt verification</h2>
        <p className="mt-1 text-sm text-slate-500">
          Verify receipt integrity status against the most recently generated artifact hash.
        </p>

        <div className="mt-4 flex gap-3">
          <input
            value={verifyReceiptId}
            onChange={(event) => setVerifyReceiptId(event.target.value)}
            placeholder="Receipt ID"
            className="flex-1 rounded-2xl border border-slate-300 px-4 py-2.5 text-sm"
          />
          <button
            type="button"
            onClick={handleVerifyReceipt}
            disabled={isVerifyingReceipt || !verifyReceiptId.trim()}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {isVerifyingReceipt ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
                Verifying...
              </>
            ) : (
              'Verify'
            )}
          </button>
        </div>

        {verifyError ? (
          <p className="mt-3 text-sm text-red-600">{verifyError}</p>
        ) : null}

        {verificationResult ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 space-y-2">
            <div>
              Result:{' '}
              <span
                className={`font-semibold ${
                  verificationResult.verdict === 'VERIFIED' ? 'text-emerald-700' : 'text-red-700'
                }`}
              >
                {verificationResult.verdict}
              </span>
            </div>
            <div>Hash: <span className="font-mono break-all">{verificationResult.hash}</span></div>
            <div>Timestamp: {verificationResult.timestamp}</div>
            <div>Anchor: {verificationResult.anchor}</div>
          </div>
        ) : null}
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Your keys</h2>
          <button
            type="button"
            onClick={handleLoadKeys}
            disabled={isPending}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            {loaded ? 'Refresh' : 'Load keys'}
          </button>
        </div>

        {loaded && keys.length === 0 ? (
          <p className="text-sm text-slate-500">No active keys yet. Create one above.</p>
        ) : null}

        {keys.map((key) => (
          <div
            key={key.id}
            className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 mt-2"
          >
            <div className="min-w-0">
              <p className="font-medium text-sm text-slate-900">{key.name}</p>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{key.key_prefix}…</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {key.revoked_at
                  ? `Revoked ${new Date(key.revoked_at).toLocaleDateString()}`
                  : `Created ${new Date(key.created_at).toLocaleDateString()}`}
              </p>
            </div>
            {!key.revoked_at ? (
              <button
                type="button"
                onClick={() => handleRevokeKey(key.id)}
                disabled={isPending}
                className="shrink-0 rounded-full border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                Revoke
              </button>
            ) : (
              <span className="shrink-0 rounded-full bg-slate-200 px-3 py-1.5 text-xs text-slate-500">
                Revoked
              </span>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
