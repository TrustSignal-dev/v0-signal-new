'use client';

import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Check,
  CircleCheckBig,
  Copy,
  CreditCard,
  FileClock,
  FileUp,
  Fingerprint,
  Globe2,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  PenLine,
  PlugZap,
  ReceiptText,
  RefreshCw,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import type { FormEvent, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  MAX_ARTIFACT_BYTES,
  parseArtifactVerificationResult,
  type ArtifactVerificationResult,
} from '@/lib/artifact-verification';

type SectionId =
  | 'overview'
  | 'receipts'
  | 'api-keys'
  | 'integrations'
  | 'audit'
  | 'team'
  | 'billing'
  | 'settings';

type ReceiptSummary = {
  receiptId: string;
  hash: string;
  timestamp: string;
  signature: string;
  verdict: 'VERIFIED' | 'ATTENTION' | 'STORED';
  source: 'account' | 'verification';
};

type CustomerReceipt = {
  receiptId: string;
  status: 'clean' | 'failure' | 'revoked' | 'compliance_gap';
  riskScore: number;
  createdAt: string;
  anchorStatus: string;
  revoked: boolean;
};

type BillingStatus = {
  plan: string;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  stripe_customer_id?: string | null;
};

type CustomerApiKey = {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
};

type SessionEvent = {
  id: string;
  action: string;
  detail: string;
  result: 'success' | 'attention' | 'info';
  createdAt: string;
};

const NAV_ITEMS: Array<{ id: SectionId; label: string; icon: LucideIcon }> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'receipts', label: 'Receipts', icon: ReceiptText },
  { id: 'api-keys', label: 'API Keys', icon: KeyRound },
  { id: 'integrations', label: 'Integrations', icon: PlugZap },
  { id: 'audit', label: 'Audit Log', icon: FileClock },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const PROOF_STEPS = [
  {
    label: 'Fingerprint created',
    detail: 'A SHA-256 fingerprint is created without retaining the document.',
    icon: Fingerprint,
  },
  {
    label: 'Receipt signed',
    detail: 'TrustSignal signs the proof metadata so changes are detectable.',
    icon: PenLine,
  },
  {
    label: 'Anchor recorded',
    detail: 'The receipt records its independent anchoring status.',
    icon: Globe2,
  },
  {
    label: 'Ready to verify',
    detail: 'A reviewer can recheck the stored receipt, signature, and proof.',
    icon: ShieldCheck,
  },
];

function pickString(data: Record<string, unknown>, keys: string[], fallback = '—') {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === 'string' && value.trim().length > 0) return value;
  }
  return fallback;
}

function buildVerificationSummary(
  payload: Record<string, unknown>,
  receiptId: string,
): ReceiptSummary {
  return {
    receiptId,
    verdict: payload.verified === true ? 'VERIFIED' : 'ATTENTION',
    hash: pickString(payload, ['storedHash', 'stored_hash', 'recomputedHash', 'recomputed_hash']),
    timestamp: new Date().toISOString(),
    signature: pickString(payload, ['signatureStatus', 'signature_status']),
    source: 'verification',
  };
}

function buildStoredReceiptSummary(receipt: CustomerReceipt): ReceiptSummary {
  return {
    receiptId: receipt.receiptId,
    hash: '—',
    timestamp: receipt.createdAt,
    signature: receipt.revoked ? 'Revoked' : 'Not rechecked',
    verdict: receipt.status === 'clean' ? 'STORED' : 'ATTENTION',
    source: 'account',
  };
}

function formatDate(value: string | null | undefined) {
  if (!value || value === '—') return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
}

function shortHash(value: string) {
  if (value === '—' || value.length < 18) return value;
  return `${value.slice(0, 10)}…${value.slice(-8)}`;
}

async function fetchCustomerApiKeys() {
  const response = await fetch('/api/keys', { cache: 'no-store' });
  const payload = (await response.json().catch(() => ({}))) as {
    keys?: CustomerApiKey[];
  };
  if (!response.ok || !Array.isArray(payload.keys)) {
    throw new Error('Unable to load API keys.');
  }
  return payload.keys;
}

async function fetchBillingStatus() {
  const response = await fetch('/api/billing/status', { cache: 'no-store' });
  const payload = (await response.json().catch(() => ({}))) as {
    billing?: BillingStatus;
  };
  if (!response.ok || !payload.billing) {
    throw new Error('Billing status is unavailable.');
  }
  return payload.billing;
}

async function fetchCustomerReceipts() {
  const response = await fetch('/api/receipts', { cache: 'no-store' });
  const payload = (await response.json().catch(() => ({}))) as {
    receipts?: CustomerReceipt[];
  };
  if (!response.ok || !Array.isArray(payload.receipts)) {
    throw new Error('Unable to load receipts.');
  }
  return payload.receipts.map(buildStoredReceiptSummary);
}

function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] ${className}`}
    >
      {children}
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="mb-7">
      <p className="mb-2 font-subtitle text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-500">
        {eyebrow}
      </p>
      <h1 className="text-3xl font-medium tracking-[-0.035em] text-neutral-950 sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 max-w-2xl text-sm font-normal leading-6 text-neutral-600 sm:text-base">
        {description}
      </p>
    </header>
  );
}

export function CustomerDashboard({ user }: { user: { email: string } }) {
  const [activeSection, setActiveSection] = useState<SectionId>('overview');
  const [keys, setKeys] = useState<CustomerApiKey[]>([]);
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [loadingBilling, setLoadingBilling] = useState(true);
  const [loadingReceipts, setLoadingReceipts] = useState(true);
  const [keyName, setKeyName] = useState('');
  const [newKeySecret, setNewKeySecret] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [creatingKey, setCreatingKey] = useState(false);
  const [billingAction, setBillingAction] = useState<'checkout' | 'portal' | null>(null);
  const [receipts, setReceipts] = useState<ReceiptSummary[]>([]);
  const [verifyReceiptId, setVerifyReceiptId] = useState('');
  const [verifyingReceipt, setVerifyingReceipt] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [receiptsError, setReceiptsError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<ReceiptSummary | null>(null);
  const [artifactFile, setArtifactFile] = useState<File | null>(null);
  const [verifyingArtifact, setVerifyingArtifact] = useState(false);
  const [artifactResult, setArtifactResult] = useState<ArtifactVerificationResult | null>(null);
  const [activity, setActivity] = useState<SessionEvent[]>([]);

  const activeKeys = useMemo(() => keys.filter((key) => !key.revoked_at), [keys]);
  const latestReceipt = receipts[0] ?? null;

  const addActivity = useCallback(
    (action: string, detail: string, result: SessionEvent['result'] = 'info') => {
      setActivity((current) => [
        {
          id: crypto.randomUUID(),
          action,
          detail,
          result,
          createdAt: new Date().toISOString(),
        },
        ...current,
      ].slice(0, 25));
    },
    [],
  );

  const loadKeys = useCallback(async () => {
    setLoadingKeys(true);
    setKeyError(null);
    try {
      setKeys(await fetchCustomerApiKeys());
    } catch {
      setKeyError('Unable to load API keys. Please try again.');
    } finally {
      setLoadingKeys(false);
    }
  }, []);

  const loadBilling = useCallback(async () => {
    setLoadingBilling(true);
    setBillingError(null);
    try {
      setBilling(await fetchBillingStatus());
    } catch {
      setBillingError('Billing status is unavailable.');
    } finally {
      setLoadingBilling(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialDashboardData() {
      const [keysResult, billingResult, receiptsResult] = await Promise.allSettled([
        fetchCustomerApiKeys(),
        fetchBillingStatus(),
        fetchCustomerReceipts(),
      ]);

      if (cancelled) return;

      if (keysResult.status === 'fulfilled') {
        setKeys(keysResult.value);
      } else {
        setKeyError('Unable to load API keys. Please try again.');
      }
      setLoadingKeys(false);

      if (billingResult.status === 'fulfilled') {
        setBilling(billingResult.value);
      } else {
        setBillingError('Billing status is unavailable.');
      }
      setLoadingBilling(false);

      if (receiptsResult.status === 'fulfilled') {
        setReceipts(receiptsResult.value);
      } else {
        setReceiptsError('Unable to load receipt history. Please try again.');
      }
      setLoadingReceipts(false);
    }

    void loadInitialDashboardData();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreateKey(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = keyName.trim();
    if (!name) return;

    setCreatingKey(true);
    setKeyError(null);
    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, scopes: ['read', 'verify'] }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        key?: CustomerApiKey & { plaintext?: string };
      };
      if (!response.ok || !payload.key?.plaintext) {
        setKeyError(
          response.status === 403
            ? 'Only an account owner or admin can create API keys.'
            : 'Could not create the API key. Please try again.',
        );
        return;
      }

      setNewKeySecret(payload.key.plaintext);
      setKeyName('');
      addActivity('API key created', `${name} was created and its secret was displayed once.`, 'success');
      await loadKeys();
    } catch {
      setKeyError('Could not create the API key. Please try again.');
    } finally {
      setCreatingKey(false);
    }
  }

  async function handleRevokeKey(key: CustomerApiKey) {
    const confirmed = window.confirm(
      `Revoke “${key.name}”? Systems using this key will immediately lose access.`,
    );
    if (!confirmed) return;

    setKeyError(null);
    const response = await fetch(`/api/keys/${encodeURIComponent(key.id)}/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'revoked_by_user' }),
    }).catch(() => null);
    if (!response?.ok) {
      setKeyError(
        response?.status === 403
          ? 'Only an account owner or admin can revoke API keys.'
          : 'Could not revoke the API key. Please try again.',
      );
      return;
    }

    setKeys((current) =>
      current.map((item) =>
        item.id === key.id ? { ...item, revoked_at: new Date().toISOString() } : item,
      ),
    );
    addActivity('API key revoked', `${key.name} no longer has access.`, 'attention');
  }

  async function copyNewSecret() {
    if (!newKeySecret) return;
    try {
      await navigator.clipboard.writeText(newKeySecret);
      setCopiedSecret(true);
      window.setTimeout(() => setCopiedSecret(false), 2000);
    } catch {
      setKeyError('Copy failed. Select the key and copy it manually.');
    }
  }

  async function handleVerifyReceipt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const receiptId = verifyReceiptId.trim();

    if (!receiptId) {
      setVerifyError('Enter a receipt ID.');
      return;
    }

    setVerifyError(null);
    setVerificationResult(null);
    setVerifyingReceipt(true);
    try {
      const response = await fetch(`/api/receipts/${encodeURIComponent(receiptId)}/verify`, {
        method: 'POST',
      });
      const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
      if (!response.ok) {
        setVerifyError(
          response.status === 503
            ? 'Receipt verification is not configured for this environment yet.'
            : 'The receipt could not be verified. Check the ID and try again.',
        );
        return;
      }

      const summary = buildVerificationSummary(payload, receiptId);
      setVerificationResult(summary);
      setReceipts((current) => [summary, ...current.filter((item) => item.receiptId !== receiptId)].slice(0, 50));
      addActivity(
        'Receipt checked',
        `${receiptId} returned ${summary.verdict.toLowerCase()}.`,
        summary.verdict === 'VERIFIED' ? 'success' : 'attention',
      );
    } catch {
      setVerifyError('The receipt could not be verified. Check the ID and try again.');
    } finally {
      setVerifyingReceipt(false);
    }
  }

  async function handleVerifyArtifact() {
    const receiptId = verifyReceiptId.trim();
    if (!receiptId || !artifactFile) {
      setVerifyError('Enter a receipt ID and choose the original artifact.');
      return;
    }
    if (artifactFile.size > MAX_ARTIFACT_BYTES) {
      setVerifyError('The artifact exceeds the 15 MiB verification limit.');
      return;
    }

    setVerifyError(null);
    setArtifactResult(null);
    setVerifyingArtifact(true);
    try {
      const form = new FormData();
      form.set('artifact', artifactFile);
      const response = await fetch(
        `/api/receipts/${encodeURIComponent(receiptId)}/verify-artifact`,
        { method: 'POST', body: form },
      );
      const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
      const artifactMatch = parseArtifactVerificationResult(payload.artifactMatch);
      if (!response.ok || !artifactMatch) {
        setVerifyError(
          response.status === 413
            ? 'The artifact exceeds the 15 MiB verification limit.'
            : 'The artifact could not be compared with this receipt.',
        );
        return;
      }

      setArtifactResult(artifactMatch);
      addActivity(
        'Artifact compared',
        `${receiptId} returned ${artifactMatch.status.toLowerCase()}.`,
        artifactMatch.matched ? 'success' : 'attention',
      );
    } catch {
      setVerifyError('The artifact could not be compared with this receipt.');
    } finally {
      setVerifyingArtifact(false);
    }
  }

  async function handleBillingAction(action: 'checkout' | 'portal') {
    setBillingAction(action);
    setBillingError(null);
    try {
      const response = await fetch(`/api/billing/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: action === 'checkout' ? JSON.stringify({ returnTo: '/dashboard' }) : undefined,
      });
      const payload = (await response.json().catch(() => ({}))) as { url?: string };
      if (!response.ok || !payload.url) {
        setBillingError(
          response.status === 403
            ? 'Only an account owner can manage billing.'
            : 'Billing is not configured for this account yet.',
        );
        return;
      }
      window.location.assign(payload.url);
    } catch {
      setBillingError('Billing is not configured for this account yet.');
    } finally {
      setBillingAction(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f3] font-normal text-neutral-950 lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="border-b border-neutral-200 bg-[#fbfbf8] lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-5 lg:block lg:px-6 lg:py-7">
          <Link href="/" className="flex items-center gap-3 text-neutral-950 no-underline">
            <span className="grid size-9 place-items-center rounded-xl border border-neutral-300 bg-white">
              <ShieldCheck className="size-5" strokeWidth={1.7} aria-hidden="true" />
            </span>
            <span>
              <strong className="block text-lg font-semibold tracking-[-0.04em]">TrustSignal</strong>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
                Proof Center
              </span>
            </span>
          </Link>
          <Link href="/docs" className="text-xs font-medium text-neutral-600 hover:text-neutral-950 lg:hidden">
            Docs
          </Link>
        </div>

        <nav
          aria-label="Dashboard"
          className="flex gap-1 overflow-x-auto px-3 pb-4 lg:grid lg:gap-1 lg:overflow-visible lg:px-4"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => setActiveSection(item.id)}
                className={`flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors lg:w-full ${
                  active
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950'
                }`}
              >
                <Icon className="size-[18px]" strokeWidth={1.8} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto hidden space-y-4 px-6 pb-6 lg:block">
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900">
              <LockKeyhole className="size-4" aria-hidden="true" />
              Secure session
            </div>
            <p className="mt-2 break-all text-xs font-normal leading-5 text-neutral-500">{user.email}</p>
          </div>
          <div className="flex items-center justify-between text-xs font-medium text-neutral-500">
            <Link href="/docs" className="inline-flex items-center gap-1.5 hover:text-neutral-950">
              <BookOpen className="size-4" aria-hidden="true" /> Docs
            </Link>
            <form action="/auth/sign-out" method="post">
              <button type="submit" className="inline-flex items-center gap-1.5 hover:text-neutral-950">
                <LogOut className="size-4" aria-hidden="true" /> Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      <main className="min-w-0">
        <header className="flex min-h-16 items-center justify-between border-b border-neutral-200 bg-[#f7f7f3]/95 px-5 backdrop-blur sm:px-8">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            TrustSignal /{' '}
            <span className="text-neutral-950">
              {NAV_ITEMS.find((item) => item.id === activeSection)?.label}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/docs" className="hidden text-sm font-medium text-neutral-600 hover:text-neutral-950 sm:block">
              Documentation
            </Link>
            <span className="grid size-9 place-items-center rounded-full border border-neutral-300 bg-white text-xs font-semibold">
              {(user.email.slice(0, 2) || 'TS').toUpperCase()}
            </span>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1220px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          {activeSection === 'overview' ? (
            <>
              <section className="mb-8 grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_180px]">
                <div>
                  <p className="mb-3 font-subtitle text-[11px] font-semibold uppercase tracking-[0.26em] text-neutral-500">
                    Evidence integrity
                  </p>
                  <h1 className="max-w-3xl text-4xl font-medium tracking-[-0.045em] text-neutral-950 sm:text-5xl">
                    {latestReceipt
                      ? latestReceipt.source === 'verification'
                        ? 'Your latest receipt check is ready to review.'
                        : 'Your latest receipt is ready to inspect.'
                      : 'Your evidence trail starts here.'}
                  </h1>
                  <p className="mt-4 max-w-2xl text-base font-normal leading-7 text-neutral-600">
                    Manage scoped API keys and recheck the integrity, signature, and proof status of receipts issued through TrustSignal integrations.
                  </p>
                </div>
                <div className="hidden justify-items-center gap-2 text-center text-neutral-700 lg:grid">
                  <div
                    className={`grid size-24 place-items-center rounded-full border-2 ${
                      latestReceipt
                        ? 'border-emerald-600 text-emerald-700'
                        : 'border-neutral-300 text-neutral-500'
                    }`}
                  >
                    <ShieldCheck className="size-12" strokeWidth={1.35} aria-hidden="true" />
                  </div>
                  <span className="font-subtitle text-[10px] font-semibold uppercase tracking-[0.2em]">
                    {latestReceipt
                      ? latestReceipt.source === 'verification'
                        ? 'Receipt checked'
                        : 'Receipt stored'
                      : 'Ready to verify'}
                  </span>
                </div>
              </section>

              <div className="mb-5 grid gap-3 sm:grid-cols-3">
                <Panel className="p-4">
                  <p className="text-xs font-medium text-neutral-500">Active API keys</p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                    {loadingKeys ? '—' : activeKeys.length}
                  </p>
                </Panel>
                <Panel className="p-4">
                  <p className="text-xs font-medium text-neutral-500">Account receipts</p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                    {loadingReceipts ? '—' : receipts.length}
                  </p>
                </Panel>
                <Panel className="p-4">
                  <p className="text-xs font-medium text-neutral-500">Monthly verifications</p>
                  <p className="mt-2 text-base font-semibold">Not connected</p>
                  <p className="mt-1 text-xs font-normal text-neutral-500">Account-scoped metering required</p>
                </Panel>
              </div>

              <Panel className="mb-5">
                <div className="grid gap-5 border-b border-neutral-200 pb-5 sm:grid-cols-2 xl:grid-cols-4">
                  {PROOF_STEPS.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.label} className="grid gap-2">
                        <div className="flex items-center gap-3">
                          <span className="grid size-10 place-items-center rounded-full border border-neutral-300 bg-[#f7f7f3]">
                            <Icon className="size-5" strokeWidth={1.6} aria-hidden="true" />
                          </span>
                          <span className="text-xs font-semibold text-neutral-400">0{index + 1}</span>
                        </div>
                        <strong className="text-sm font-semibold">{step.label}</strong>
                        <p className="text-xs font-normal leading-5 text-neutral-500">{step.detail}</p>
                      </div>
                    );
                  })}
                </div>

                {latestReceipt ? (
                  <div className="grid gap-4 pt-5 md:grid-cols-[1.2fr_1fr_1fr_auto] md:items-center">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Receipt ID</p>
                      <p className="mt-1 break-all font-mono text-sm font-medium">{latestReceipt.receiptId}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Stored receipt hash</p>
                      <p className="mt-1 font-mono text-sm font-medium">{shortHash(latestReceipt.hash)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                        {latestReceipt.source === 'verification' ? 'Checked' : 'Created'}
                      </p>
                      <p className="mt-1 text-sm font-medium">{formatDate(latestReceipt.timestamp)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSection('receipts')}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-neutral-300 px-4 text-sm font-semibold hover:bg-neutral-50"
                    >
                      Inspect <ArrowRight className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-3 pt-5">
                    <div className="min-w-0 flex-1">
                      <strong className="text-sm font-semibold">No receipts have been issued for this account.</strong>
                      <p className="mt-1 text-xs font-normal text-neutral-500">
                        Issue one through the API, or enter a receipt ID to verify its integrity and signature.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSection('receipts')}
                      className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-neutral-900 px-4 text-sm font-semibold text-white hover:bg-neutral-800"
                    >
                      Open receipts <ArrowRight className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </Panel>

              <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.7fr)]">
                <Panel>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-medium">Recent receipt activity</h2>
                      <p className="mt-1 text-sm font-normal text-neutral-500">
                        Tenant-scoped receipts issued for this signed-in account.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSection('receipts')}
                      className="shrink-0 text-xs font-semibold text-neutral-600 hover:text-neutral-950"
                    >
                      View receipts
                    </button>
                  </div>
                  {receipts.length ? (
                    <div className="mt-4 divide-y divide-neutral-200 border-t border-neutral-200">
                      {receipts.slice(0, 4).map((receipt) => (
                        <button
                          key={`${receipt.receiptId}-${receipt.timestamp}`}
                          type="button"
                          onClick={() => {
                            setVerifyReceiptId(receipt.receiptId);
                            setActiveSection('receipts');
                          }}
                          className="grid w-full gap-2 py-4 text-left sm:grid-cols-[1.2fr_1fr_auto] sm:items-center"
                        >
                          <span className="font-mono text-xs font-medium">{receipt.receiptId}</span>
                          <span className="text-xs font-normal text-neutral-500">{formatDate(receipt.timestamp)}</span>
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                              receipt.verdict === 'VERIFIED'
                                ? 'text-emerald-700'
                                : receipt.verdict === 'STORED'
                                  ? 'text-neutral-600'
                                  : 'text-amber-700'
                            }`}
                          >
                            {receipt.verdict === 'VERIFIED' ? (
                              <CircleCheckBig className="size-4" aria-hidden="true" />
                            ) : receipt.verdict === 'STORED' ? (
                              <ReceiptText className="size-4" aria-hidden="true" />
                            ) : (
                              <AlertTriangle className="size-4" aria-hidden="true" />
                            )}
                            {receipt.verdict === 'VERIFIED'
                              ? 'Verified now'
                              : receipt.verdict === 'STORED'
                                ? 'Stored'
                                : 'Attention'}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 grid min-h-32 place-items-center rounded-xl border border-dashed border-neutral-300 text-center">
                      <p className="text-sm font-normal text-neutral-500">
                        {receiptsError ?? 'Issued receipts will appear here.'}
                      </p>
                    </div>
                  )}
                </Panel>

                <Panel className="flex flex-col">
                  <h2 className="text-lg font-medium">API access</h2>
                  <p className="mt-1 text-sm font-normal text-neutral-500">Use scoped keys for programmatic verification.</p>
                  <dl className="mt-5 divide-y divide-neutral-200 rounded-xl border border-neutral-200">
                    <div className="flex items-center justify-between p-3 text-sm">
                      <dt className="font-normal text-neutral-500">Active keys</dt>
                      <dd className="font-semibold">{loadingKeys ? '—' : activeKeys.length}</dd>
                    </div>
                    <div className="flex items-center justify-between p-3 text-sm">
                      <dt className="font-normal text-neutral-500">Default scope</dt>
                      <dd className="font-semibold">verify, read</dd>
                    </div>
                    <div className="flex items-center justify-between p-3 text-sm">
                      <dt className="font-normal text-neutral-500">Secret storage</dt>
                      <dd className="font-semibold">Hashed</dd>
                    </div>
                  </dl>
                  <button
                    type="button"
                    onClick={() => setActiveSection('api-keys')}
                    className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 text-sm font-semibold text-white hover:bg-neutral-800"
                  >
                    Manage API keys <ArrowRight className="size-4" aria-hidden="true" />
                  </button>
                </Panel>
              </div>
            </>
          ) : null}

          {activeSection === 'receipts' ? (
            <>
              <SectionHeading
                eyebrow="Cryptographic receipts"
                title="Verify signed proof."
                description="Check the stored receipt and, when needed, compare the original artifact bytes with the document digest committed inside its signed proof."
              />
              <div className="grid gap-5 xl:grid-cols-2">
                <Panel>
                  <div className="flex items-start gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-neutral-100">
                      <PlugZap className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="text-lg font-medium">Receipt issuance</h2>
                      <p className="mt-1 text-sm font-normal text-neutral-500">
                        Receipts are issued by your application or integration using the TrustSignal API.
                      </p>
                    </div>
                  </div>
                  <ol className="mt-6 grid gap-3 text-sm font-normal text-neutral-600">
                    <li className="rounded-xl border border-neutral-200 p-4">
                      <strong className="block font-semibold text-neutral-950">1. Create an API key</strong>
                      Use an owner- or admin-managed credential with verification scope.
                    </li>
                    <li className="rounded-xl border border-neutral-200 p-4">
                      <strong className="block font-semibold text-neutral-950">2. Issue through the API</strong>
                      Send the complete workflow evidence required by the documented verification contract.
                    </li>
                    <li className="rounded-xl border border-neutral-200 p-4">
                      <strong className="block font-semibold text-neutral-950">3. Return here to check it</strong>
                      Paste the receipt ID to recheck the stored receipt later.
                    </li>
                  </ol>
                  <Link
                    href="/docs/api"
                    className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 text-sm font-semibold text-white hover:bg-neutral-800"
                  >
                    Open API documentation <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Panel>

                <Panel>
                  <div className="flex items-start gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-neutral-100">
                      <ShieldCheck className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="text-lg font-medium">Verify a receipt</h2>
                      <p className="mt-1 text-sm font-normal text-neutral-500">
                        Recompute the stored receipt hash and verify its signature and proof status.
                      </p>
                    </div>
                  </div>
                  <form onSubmit={handleVerifyReceipt} className="mt-6 space-y-4">
                    <label className="block text-sm font-semibold">
                      Receipt ID
                      <input
                        value={verifyReceiptId}
                        onChange={(event) => setVerifyReceiptId(event.target.value)}
                        autoComplete="off"
                        placeholder="Receipt UUID"
                        className="mt-2 block w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 font-mono text-sm font-normal outline-none focus:border-neutral-700"
                      />
                    </label>
                    <label className="block text-sm font-semibold">
                      Original artifact{' '}
                      <span id="artifact-limit-hint" className="font-normal text-neutral-500">
                        (optional, up to 15 MiB)
                      </span>
                      <input
                        type="file"
                        aria-describedby="artifact-limit-hint"
                        onChange={(event) => {
                          const selectedFile = event.target.files?.[0] ?? null;
                          if (selectedFile && selectedFile.size > MAX_ARTIFACT_BYTES) {
                            setArtifactFile(null);
                            setArtifactResult(null);
                            setVerifyError('The artifact exceeds the 15 MiB verification limit.');
                            event.currentTarget.value = '';
                            return;
                          }
                          setArtifactFile(selectedFile);
                          setArtifactResult(null);
                          setVerifyError(null);
                        }}
                        className="mt-2 block w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm font-normal file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-100 file:px-3 file:py-2 file:text-xs file:font-semibold"
                      />
                    </label>
                    {verifyError ? (
                      <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-normal text-red-700">
                        {verifyError}
                      </p>
                    ) : null}
                    <button
                      type="submit"
                      disabled={verifyingReceipt}
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 text-sm font-semibold hover:bg-neutral-50 disabled:opacity-50"
                    >
                      {verifyingReceipt ? (
                        <RefreshCw className="size-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <ShieldCheck className="size-4" aria-hidden="true" />
                      )}
                      {verifyingReceipt ? 'Verifying…' : 'Verify integrity'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleVerifyArtifact()}
                      disabled={verifyingArtifact || !artifactFile}
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
                    >
                      {verifyingArtifact ? (
                        <RefreshCw className="size-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <FileUp className="size-4" aria-hidden="true" />
                      )}
                      {verifyingArtifact ? 'Comparing…' : 'Compare artifact to receipt'}
                    </button>
                    {artifactResult ? (
                      <div
                        role="status"
                        aria-live="polite"
                        aria-atomic="true"
                        className={`rounded-xl border p-3 text-sm ${
                          artifactResult.status === 'MATCH'
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                            : artifactResult.status === 'MISMATCH'
                              ? 'border-red-300 bg-red-50 text-red-950'
                              : 'border-amber-300 bg-amber-50 text-amber-950'
                        }`}
                      >
                        <strong className="block font-semibold">
                          {artifactResult.status === 'MATCH'
                            ? 'Artifact matches the signed receipt.'
                            : artifactResult.status === 'MISMATCH'
                              ? 'Artifact does not match the signed receipt.'
                              : 'Artifact comparison is inconclusive.'}
                        </strong>
                        <span className="mt-1 block font-mono text-xs">{artifactResult.reasonCode}</span>
                      </div>
                    ) : null}
                  </form>
                </Panel>
              </div>

              {verificationResult ? (
                <Panel
                  className={`mt-5 ${
                    verificationResult.verdict === 'VERIFIED'
                      ? 'border-emerald-300 bg-emerald-50/50'
                      : 'border-red-300 bg-red-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {verificationResult.verdict === 'VERIFIED' ? (
                      <CircleCheckBig className="size-6 text-emerald-700" aria-hidden="true" />
                    ) : (
                      <AlertTriangle className="size-6 text-red-700" aria-hidden="true" />
                    )}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                        Verification result
                      </p>
                      <h2 className="mt-1 text-xl font-medium">
                        {verificationResult.verdict === 'VERIFIED'
                          ? 'Receipt integrity and signature verified.'
                          : 'Receipt checks require attention.'}
                      </h2>
                    </div>
                  </div>
                  <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
                    <div>
                      <dt className="text-xs font-normal text-neutral-500">Stored receipt hash</dt>
                      <dd className="mt-1 break-all font-mono font-medium">{verificationResult.hash}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-normal text-neutral-500">Checked</dt>
                      <dd className="mt-1 font-medium">{formatDate(verificationResult.timestamp)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-normal text-neutral-500">Signature</dt>
                      <dd className="mt-1 font-medium">{verificationResult.signature}</dd>
                    </div>
                  </dl>
                </Panel>
              ) : null}

              <Panel className="mt-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-medium">Account receipt history</h2>
                    <p className="mt-1 text-sm font-normal text-neutral-500">
                      Only receipts owned by this signed-in account are returned by the core API.
                    </p>
                  </div>
                  <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold">{receipts.length}</span>
                </div>
                {receipts.length ? (
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-neutral-200 text-xs text-neutral-500">
                          <th className="py-3 pr-4 font-medium">Receipt</th>
                          <th className="py-3 pr-4 font-medium">Stored hash</th>
                          <th className="py-3 pr-4 font-medium">Created / checked</th>
                          <th className="py-3 font-medium">Signature</th>
                        </tr>
                      </thead>
                      <tbody>
                        {receipts.map((receipt) => (
                          <tr key={`${receipt.receiptId}-${receipt.timestamp}`} className="border-b border-neutral-100 last:border-0">
                            <td className="py-4 pr-4 font-mono text-xs font-medium">{receipt.receiptId}</td>
                            <td className="py-4 pr-4 font-mono text-xs font-normal">{shortHash(receipt.hash)}</td>
                            <td className="py-4 pr-4 font-normal text-neutral-600">{formatDate(receipt.timestamp)}</td>
                            <td className="py-4 font-medium">{receipt.signature}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="mt-4 grid min-h-28 place-items-center rounded-xl border border-dashed border-neutral-300">
                    <p className="text-sm font-normal text-neutral-500">
                      {loadingReceipts ? 'Loading receipt history…' : receiptsError ?? 'No receipts issued for this account.'}
                    </p>
                  </div>
                )}
              </Panel>
            </>
          ) : null}

          {activeSection === 'api-keys' ? (
            <>
              <SectionHeading
                eyebrow="Programmatic access"
                title="API keys"
                description="Create scoped credentials for verification workflows. Full secrets are displayed once; TrustSignal stores only the hash."
              />
              {newKeySecret ? (
                <div className="mb-5 rounded-2xl border border-emerald-300 bg-emerald-50 p-5" role="status">
                  <div className="flex items-start gap-3">
                    <CircleCheckBig className="mt-0.5 size-5 shrink-0 text-emerald-700" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <h2 className="text-base font-semibold text-emerald-950">Copy this key now</h2>
                      <p className="mt-1 text-sm font-normal text-emerald-800">
                        This is the only time the complete secret will be displayed.
                      </p>
                      <code className="mt-3 block break-all rounded-xl border border-emerald-200 bg-white p-3 font-mono text-xs font-medium text-neutral-900">
                        {newKeySecret}
                      </code>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => void copyNewSecret()}
                          className="inline-flex items-center gap-2 rounded-lg bg-emerald-800 px-3 py-2 text-xs font-semibold text-white"
                        >
                          {copiedSecret ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
                          {copiedSecret ? 'Copied' : 'Copy key'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNewKeySecret(null);
                            setCopiedSecret(false);
                          }}
                          className="rounded-lg border border-emerald-300 px-3 py-2 text-xs font-semibold text-emerald-900"
                        >
                          I saved it
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="grid gap-5 lg:grid-cols-[minmax(280px,0.7fr)_minmax(0,1.3fr)]">
                <Panel>
                  <h2 className="text-lg font-medium">Create a key</h2>
                  <p className="mt-1 text-sm font-normal text-neutral-500">Use a name that identifies the system using it.</p>
                  <form onSubmit={handleCreateKey} className="mt-5 space-y-4">
                    <label className="block text-sm font-semibold">
                      Key name
                      <input
                        value={keyName}
                        onChange={(event) => setKeyName(event.target.value)}
                        maxLength={120}
                        placeholder="Production API"
                        className="mt-2 block w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm font-normal outline-none focus:border-neutral-700"
                      />
                    </label>
                    <div className="rounded-xl bg-neutral-100 p-3 text-xs font-normal leading-5 text-neutral-600">
                      <strong className="font-semibold text-neutral-900">Default scope:</strong> verify and read. Revoke and replace a key immediately if it is exposed.
                    </div>
                    {keyError ? (
                      <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-normal text-red-700">
                        {keyError}
                      </p>
                    ) : null}
                    <button
                      type="submit"
                      disabled={creatingKey || !keyName.trim()}
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
                    >
                      {creatingKey ? <RefreshCw className="size-4 animate-spin" aria-hidden="true" /> : <KeyRound className="size-4" aria-hidden="true" />}
                      {creatingKey ? 'Creating…' : 'Create API key'}
                    </button>
                  </form>
                </Panel>

                <Panel>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-medium">Your keys</h2>
                      <p className="mt-1 text-sm font-normal text-neutral-500">
                        Only prefixes and metadata remain visible after creation.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void loadKeys()}
                      disabled={loadingKeys}
                      className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-xs font-semibold hover:bg-neutral-50 disabled:opacity-50"
                    >
                      <RefreshCw className={`size-4 ${loadingKeys ? 'animate-spin' : ''}`} aria-hidden="true" /> Refresh
                    </button>
                  </div>
                  {loadingKeys ? (
                    <div className="mt-5 grid min-h-36 place-items-center text-sm font-normal text-neutral-500">Loading keys…</div>
                  ) : keys.length ? (
                    <div className="mt-4 divide-y divide-neutral-200 border-t border-neutral-200">
                      {keys.map((key) => (
                        <div key={key.id} className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <strong className="text-sm font-semibold">{key.name}</strong>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                                  key.revoked_at
                                    ? 'bg-neutral-100 text-neutral-500'
                                    : 'bg-emerald-50 text-emerald-700'
                                }`}
                              >
                                {key.revoked_at ? 'Revoked' : 'Active'}
                              </span>
                            </div>
                            <p className="mt-1 font-mono text-xs font-normal text-neutral-500">{key.key_prefix}…</p>
                            <p className="mt-1 text-xs font-normal text-neutral-400">
                              Created {formatDate(key.created_at)} · Last used {formatDate(key.last_used_at)}
                            </p>
                          </div>
                          {!key.revoked_at ? (
                            <button
                              type="button"
                              onClick={() => void handleRevokeKey(key)}
                              className="justify-self-start rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 sm:justify-self-end"
                            >
                              Revoke
                            </button>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-5 grid min-h-36 place-items-center rounded-xl border border-dashed border-neutral-300 text-center">
                      <p className="text-sm font-normal text-neutral-500">No API keys yet.</p>
                    </div>
                  )}
                </Panel>
              </div>
            </>
          ) : null}

          {activeSection === 'integrations' ? (
            <>
              <SectionHeading
                eyebrow="Connections"
                title="Integrations"
                description="Connect evidence sources through isolated, least-privilege adapters. Nothing is connected automatically."
              />
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  {
                    name: 'Vanta',
                    status: 'Not connected',
                    detail: 'The Vanta connector requires an approved credential handoff and scoped activation.',
                  },
                  {
                    name: 'GitHub',
                    status: 'Sign-in available',
                    detail: 'GitHub OAuth is available for account authentication. Repository evidence access is separate.',
                  },
                  {
                    name: 'TrustSignal API',
                    status: activeKeys.length ? 'Key available' : 'Needs API key',
                    detail: 'Use a scoped API key to submit verification work from your own systems.',
                  },
                ].map((integration) => (
                  <Panel key={integration.name} className="flex min-h-56 flex-col">
                    <div className="flex items-center justify-between gap-3">
                      <span className="grid size-10 place-items-center rounded-xl bg-neutral-100">
                        <PlugZap className="size-5" aria-hidden="true" />
                      </span>
                      <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-600">
                        {integration.status}
                      </span>
                    </div>
                    <h2 className="mt-6 text-xl font-medium">{integration.name}</h2>
                    <p className="mt-2 text-sm font-normal leading-6 text-neutral-500">{integration.detail}</p>
                  </Panel>
                ))}
              </div>
              <Panel className="mt-5">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-medium">Build against the verification API</h2>
                    <p className="mt-1 text-sm font-normal text-neutral-500">
                      Review the request format and security model before wiring a production source.
                    </p>
                  </div>
                  <Link href="/docs/api" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-neutral-300 px-4 text-sm font-semibold hover:bg-neutral-50">
                    Open API docs <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </div>
              </Panel>
            </>
          ) : null}

          {activeSection === 'audit' ? (
            <>
              <SectionHeading
                eyebrow="Account activity"
                title="Audit log"
                description="This view shows security-relevant actions from the current browser session. It is not a persistent compliance export."
              />
              <Panel>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-medium">Session activity</h2>
                    <p className="mt-1 text-sm font-normal text-neutral-500">
                      Key and receipt actions performed since this page was opened.
                    </p>
                  </div>
                  <Activity className="size-5 text-neutral-400" aria-hidden="true" />
                </div>
                {activity.length ? (
                  <ol className="mt-5 divide-y divide-neutral-200 border-t border-neutral-200">
                    {activity.map((event) => (
                      <li key={event.id} className="grid gap-2 py-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-start">
                        <span
                          className={`mt-1 size-2.5 rounded-full ${
                            event.result === 'success'
                              ? 'bg-emerald-600'
                              : event.result === 'attention'
                                ? 'bg-amber-500'
                                : 'bg-neutral-400'
                          }`}
                        />
                        <div>
                          <strong className="text-sm font-semibold">{event.action}</strong>
                          <p className="mt-1 text-sm font-normal text-neutral-500">{event.detail}</p>
                        </div>
                        <time className="text-xs font-normal text-neutral-400">{formatDate(event.createdAt)}</time>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <div className="mt-5 grid min-h-40 place-items-center rounded-xl border border-dashed border-neutral-300 text-center">
                    <div>
                      <FileClock className="mx-auto size-6 text-neutral-400" aria-hidden="true" />
                      <p className="mt-3 text-sm font-normal text-neutral-500">No security-relevant actions in this session.</p>
                    </div>
                  </div>
                )}
              </Panel>
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-normal leading-6 text-amber-900">
                <strong className="font-semibold">Persistent export is intentionally not represented as complete.</strong>{' '}
                A tenant-scoped server audit feed must be connected before this page can serve as compliance evidence.
              </div>
            </>
          ) : null}

          {activeSection === 'team' ? (
            <>
              <SectionHeading
                eyebrow="Access control"
                title="Team"
                description="See the signed-in member and the controls that protect account access."
              />
              <div className="grid gap-5 lg:grid-cols-2">
                <Panel>
                  <h2 className="text-lg font-medium">Current member</h2>
                  <div className="mt-5 flex items-center gap-4 rounded-xl border border-neutral-200 p-4">
                    <span className="grid size-11 place-items-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                      {(user.email.slice(0, 2) || 'TS').toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <strong className="block truncate text-sm font-semibold">{user.email}</strong>
                      <span className="text-xs font-normal text-neutral-500">Authenticated member</span>
                    </div>
                  </div>
                </Panel>
                <Panel>
                  <h2 className="text-lg font-medium">Team administration</h2>
                  <p className="mt-3 text-sm font-normal leading-6 text-neutral-500">
                    Invites and role changes are not enabled in this dashboard yet. This prevents the interface from implying permissions that the server does not currently enforce.
                  </p>
                  <div className="mt-5 flex items-center gap-2 rounded-xl bg-neutral-100 p-3 text-xs font-medium text-neutral-600">
                    <LockKeyhole className="size-4" aria-hidden="true" /> Least-privilege controls required before activation
                  </div>
                </Panel>
              </div>
            </>
          ) : null}

          {activeSection === 'billing' ? (
            <>
              <SectionHeading
                eyebrow="Subscription"
                title="Billing"
                description="Review the account plan and open the secure Stripe flow when billing is configured."
              />
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                <Panel>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Current plan</p>
                      <h2 className="mt-2 text-3xl font-medium capitalize">
                        {loadingBilling ? 'Loading…' : billing?.plan ?? 'Unavailable'}
                      </h2>
                    </div>
                    {billing ? (
                      <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold capitalize text-neutral-600">
                        {billing.status}
                      </span>
                    ) : null}
                  </div>
                  {billing ? (
                    <dl className="mt-6 grid gap-4 border-t border-neutral-200 pt-5 sm:grid-cols-2">
                      <div>
                        <dt className="text-xs font-normal text-neutral-500">Period ends</dt>
                        <dd className="mt-1 text-sm font-semibold">{formatDate(billing.current_period_end)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-normal text-neutral-500">Renewal</dt>
                        <dd className="mt-1 text-sm font-semibold">
                          {billing.cancel_at_period_end ? 'Cancels at period end' : 'No cancellation scheduled'}
                        </dd>
                      </div>
                    </dl>
                  ) : null}
                  {billingError ? (
                    <p role="alert" className="mt-5 rounded-lg bg-amber-50 p-3 text-sm font-normal text-amber-900">
                      {billingError}
                    </p>
                  ) : null}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => void handleBillingAction(billing?.stripe_customer_id ? 'portal' : 'checkout')}
                      disabled={Boolean(billingAction)}
                      className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-neutral-900 px-4 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
                    >
                      <CreditCard className="size-4" aria-hidden="true" />
                      {billingAction ? 'Opening…' : billing?.stripe_customer_id ? 'Manage billing' : 'Choose a paid plan'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void loadBilling()}
                      disabled={loadingBilling}
                      className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-neutral-300 px-4 text-sm font-semibold hover:bg-neutral-50"
                    >
                      <RefreshCw className={`size-4 ${loadingBilling ? 'animate-spin' : ''}`} aria-hidden="true" /> Refresh
                    </button>
                  </div>
                </Panel>
                <Panel>
                  <LockKeyhole className="size-6 text-neutral-500" aria-hidden="true" />
                  <h2 className="mt-4 text-lg font-medium">Secure billing handoff</h2>
                  <p className="mt-2 text-sm font-normal leading-6 text-neutral-500">
                    Checkout and payment-method management open in Stripe. TrustSignal does not collect card details in this dashboard.
                  </p>
                </Panel>
              </div>
            </>
          ) : null}

          {activeSection === 'settings' ? (
            <>
              <SectionHeading
                eyebrow="Account controls"
                title="Settings"
                description="Security and account actions for this TrustSignal session."
              />
              <div className="grid gap-5 lg:grid-cols-2">
                <Panel>
                  <h2 className="text-lg font-medium">Security posture</h2>
                  <dl className="mt-5 divide-y divide-neutral-200 rounded-xl border border-neutral-200">
                    <div className="flex items-center justify-between gap-3 p-4">
                      <dt className="text-sm font-normal text-neutral-500">Session</dt>
                      <dd className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                        <CircleCheckBig className="size-4" aria-hidden="true" /> Authenticated
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3 p-4">
                      <dt className="text-sm font-normal text-neutral-500">API secrets</dt>
                      <dd className="text-sm font-semibold">Shown once, hashed at rest</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3 p-4">
                      <dt className="text-sm font-normal text-neutral-500">Receipt documents</dt>
                      <dd className="text-sm font-semibold">Not retained by dashboard</dd>
                    </div>
                  </dl>
                </Panel>
                <Panel className="flex flex-col">
                  <h2 className="text-lg font-medium">Account</h2>
                  <p className="mt-2 break-all text-sm font-normal text-neutral-500">{user.email}</p>
                  <div className="mt-6 grid gap-3">
                    <Link href="/docs" className="inline-flex min-h-11 items-center justify-between rounded-lg border border-neutral-300 px-4 text-sm font-semibold hover:bg-neutral-50">
                      Documentation <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                    <form action="/auth/sign-out" method="post">
                      <button type="submit" className="inline-flex min-h-11 w-full items-center justify-between rounded-lg border border-red-200 px-4 text-sm font-semibold text-red-700 hover:bg-red-50">
                        Sign out <LogOut className="size-4" aria-hidden="true" />
                      </button>
                    </form>
                  </div>
                </Panel>
              </div>
              <div className="mt-5 rounded-xl border border-neutral-200 bg-white p-4 text-sm font-normal text-neutral-600">
                <strong className="font-semibold text-neutral-900">Usage metering:</strong> Account-scoped usage will appear after the production API contract is connected.
              </div>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}
