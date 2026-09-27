'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Anchor, BookOpen, FileCheck2, KeyRound, LayoutDashboard, LogOut, RefreshCw, Settings, ShieldCheck, Users } from 'lucide-react';
import {
  createDashboardKey, dashboardError, DashboardSessionError, listDashboardKeys, listDashboardReceipts,
  revokeDashboardKey, verifyDashboardReceipt,
  type DashboardKey, type DashboardReceipt, type DashboardVerification,
} from '@/lib/dashboard-api';
import './operations-dashboard.css';
import { DocumentReceiptPanel } from './document-receipt-panel';

type Section = 'overview' | 'api-keys' | 'receipts';
type LoadState = 'loading' | 'ready' | 'error';
function requestDashboardData() {
  return Promise.allSettled([listDashboardKeys(), listDashboardReceipts()]);
}

function Panel({ title, subtitle, children, action }: { title: string; subtitle: string; children: ReactNode; action?: ReactNode }) {
  return <section className="ops-panel"><div className="ops-panel-heading"><div><h2>{title}</h2><p className="ops-eyebrow">{subtitle}</p></div>{action}</div>{children}</section>;
}
function date(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 'Unknown' : parsed.toLocaleString();
}

export function OperationsDashboard({ user, section = 'overview' }: { user: { email: string }; section?: Section }) {
  const router = useRouter();
  const [keys, setKeys] = useState<DashboardKey[]>([]);
  const [receipts, setReceipts] = useState<DashboardReceipt[]>([]);
  const [keyState, setKeyState] = useState<LoadState>('loading');
  const [receiptState, setReceiptState] = useState<LoadState>('loading');
  const [keyError, setKeyError] = useState('');
  const [receiptError, setReceiptError] = useState('');
  const [actionError, setActionError] = useState('');
  const [keyName, setKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<{ id: string; secret: string } | null>(null);
  const [pending, setPending] = useState(false);
  const [query, setQuery] = useState('');
  const [receiptId, setReceiptId] = useState('');
  const [verification, setVerification] = useState<{ id: string; result: DashboardVerification } | null>(null);
  const [verifyError, setVerifyError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  const [signOutError, setSignOutError] = useState('');
  const [signingOut, setSigningOut] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const sessionGeneration = useRef(0);
  const verificationGeneration = useRef(0);
  const dataBusy = useRef(false);
  const logoutBusy = useRef(false);
  const mounted = useRef(false);
  const authenticationLost = useRef(false);

  const expireSession = useCallback(() => {
    authenticationLost.current = true;
    setSessionExpired(true);
    sessionGeneration.current += 1;
    verificationGeneration.current += 1;
    setCreatedKey(null); setCopyMessage(''); setKeyName('');
    setKeys([]); setReceipts([]); setQuery(''); setReceiptId('');
    setVerification(null); setVerifyError(''); setVerifying(false);
    setActionError(''); setKeyState('error'); setReceiptState('error');
    setKeyError(new DashboardSessionError().message);
    setReceiptError(new DashboardSessionError().message);
  }, []);

  const applyResults = useCallback(([keyResult, receiptResult]: Awaited<ReturnType<typeof requestDashboardData>>) => {
    if ([keyResult, receiptResult].some((result) => result.status === 'rejected' && result.reason instanceof DashboardSessionError)) {
      expireSession();
      return;
    }
    if (keyResult.status === 'fulfilled') { setKeys(keyResult.value); setKeyState('ready'); }
    else { setKeys([]); setKeyError(dashboardError(keyResult.reason)); setKeyState('error'); }
    if (receiptResult.status === 'fulfilled') { setReceipts(receiptResult.value); setReceiptState('ready'); }
    else { setReceipts([]); setReceiptError(dashboardError(receiptResult.reason)); setReceiptState('error'); }
  }, [expireSession]);
  useEffect(() => {
    mounted.current = true;
    let cancelled = false;
    const session = sessionGeneration.current;
    void requestDashboardData().then((results) => {
      if (!cancelled && session === sessionGeneration.current) applyResults(results);
    });
    return () => { cancelled = true; mounted.current = false; sessionGeneration.current += 1; };
  }, [applyResults]);
  function clearVerification() {
    verificationGeneration.current += 1;
    setVerification(null); setVerifyError(''); setVerifying(false);
  }
  async function refresh() {
    if (!mounted.current || dataBusy.current || logoutBusy.current || authenticationLost.current) return;
    dataBusy.current = true;
    const session = sessionGeneration.current;
    clearVerification();
    setKeyState('loading'); setReceiptState('loading'); setKeyError(''); setReceiptError('');
    const results = await requestDashboardData();
    if (session === sessionGeneration.current) {
      applyResults(results);
    }
    dataBusy.current = false;
    if (mounted.current && session !== sessionGeneration.current && !logoutBusy.current) void refresh();
  }
  async function signOut() {
    if (logoutBusy.current) return;
    logoutBusy.current = true;
    sessionGeneration.current += 1;
    // Retain the data lock until any pre-logout mutation settles. If logout
    // fails, recovery must read after that operation has finished committing.
    clearVerification();
    setSigningOut(true); setSignOutError(''); setCreatedKey(null);
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
      if (!response.ok) throw new Error('sign_out_failed');
      router.push('/sign-in');
      router.refresh();
    } catch {
      logoutBusy.current = false;
      setSignOutError('Sign out failed. Please try again.'); setSigningOut(false);
      // Discard earlier responses and reload authoritative account state.
      void refresh();
    }
  }

  async function createKey(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (dataBusy.current || logoutBusy.current || keyState !== 'ready') return;
    dataBusy.current = true;
    const session = sessionGeneration.current;
    setPending(true); setActionError(''); setCopyMessage('');
    try {
      const { plaintext, ...record } = await createDashboardKey(keyName.trim());
      if (session !== sessionGeneration.current) return;
      // Keep the one-time secret only in component memory, never storage or URLs.
      setCreatedKey({ id: record.id, secret: plaintext });
      setKeys((current) => [record, ...current]); setKeyName('');
    } catch (error) {
      if (session === sessionGeneration.current) {
        if (error instanceof DashboardSessionError) expireSession();
        else setActionError(dashboardError(error));
      }
    }
    finally {
      dataBusy.current = false;
      if (mounted.current) {
        setPending(false);
        if (session !== sessionGeneration.current && !logoutBusy.current) void refresh();
      }
    }
  }
  async function revoke(key: DashboardKey) {
    if (dataBusy.current || logoutBusy.current || keyState !== 'ready' || !window.confirm(`Revoke “${key.name}”? Applications using it will lose access.`)) return;
    dataBusy.current = true;
    const session = sessionGeneration.current;
    setPending(true); setActionError('');
    try {
      await revokeDashboardKey(key.id);
      if (session !== sessionGeneration.current) return;
      setKeys((current) => current.map((item) => item.id === key.id ? { ...item, revoked_at: new Date().toISOString() } : item));
      if (createdKey?.id === key.id) setCreatedKey(null);
    } catch (error) {
      if (session === sessionGeneration.current) {
        if (error instanceof DashboardSessionError) expireSession();
        else setActionError(dashboardError(error));
      }
    }
    finally {
      dataBusy.current = false;
      if (mounted.current) {
        setPending(false);
        if (session !== sessionGeneration.current && !logoutBusy.current) void refresh();
      }
    }
  }
  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (verifying || logoutBusy.current || receiptState !== 'ready') return;
    const session = sessionGeneration.current;
    const request = ++verificationGeneration.current;
    const isCurrent = () => session === sessionGeneration.current && request === verificationGeneration.current;
    setVerifying(true); setVerifyError(''); setVerification(null);
    const id = receiptId.trim();
    try {
      const result = await verifyDashboardReceipt(id);
      if (isCurrent()) setVerification({ id, result });
    } catch (error) {
      if (isCurrent()) {
        if (error instanceof DashboardSessionError) expireSession();
        else setVerifyError(dashboardError(error));
      }
    }
    finally { if (isCurrent()) setVerifying(false); }
  }
  async function copySecret() {
    if (!createdKey) return;
    try { await navigator.clipboard.writeText(createdKey.secret); setCopyMessage('Copied. Store it securely.'); }
    catch { setCopyMessage('Copy failed. Select and copy the key manually.'); }
  }

  const activeKeys = keys.filter((key) => !key.revoked_at);
  const selectedReceipts = receipts.filter((receipt) => `${receipt.receiptId} ${receipt.status} ${receipt.anchorStatus}`.toLowerCase().includes(query.toLowerCase()));
  const attention = receipts.filter((receipt) => receipt.status !== 'clean' || receipt.revoked).length;
  const status = keyState === 'loading' || receiptState === 'loading' ? 'Checking' : keyState === 'ready' && receiptState === 'ready' ? 'Connected' : 'Attention';
  const nav = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'receipts', label: 'Receipts', icon: FileCheck2 },
    { id: 'api-keys', label: 'API Keys', icon: KeyRound },
  ];

  return <div className="ops-console">
    <aside className="ops-sidebar">
      <Link className="ops-brand" href="/"><span>TS</span><div>TrustSignal<small>CONSOLE</small></div></Link>
      <p className="ops-eyebrow">Operations</p>
      <nav aria-label="Dashboard navigation">{nav.map(({ id, label, icon: Icon }) => <Link key={id} href={`/dashboard?section=${id}`} aria-current={section === id ? 'page' : undefined}><Icon size={16} />{label}</Link>)}</nav>
      <p className="ops-eyebrow">Integrity</p>
      <p className="ops-muted ops-sidebar-note">NFC provisioning, signing-key rotation and registry monitoring are not connected to this console.</p>
      <p className="ops-eyebrow">Account</p>
      <nav aria-label="Account navigation">
        <Link href="/dashboard?section=billing"><Anchor size={16} />Billing</Link>
        <Link href="/dashboard?section=team"><Users size={16} />Members</Link>
        <Link href="/dashboard?section=settings"><Settings size={16} />Settings</Link>
        <Link href="/docs"><BookOpen size={16} />Documentation</Link>
        <button disabled={signingOut} onClick={() => void signOut()}><LogOut size={16} />{signingOut ? 'Signing out…' : 'Sign out'}</button>
        {signOutError && <p role="alert" className="ops-error">{signOutError}</p>}
      </nav>
      <div className="ops-sidebar-status"><p className="ops-eyebrow">Account API access</p><span className={`ops-badge ${status === 'Connected' ? 'ops-good' : ''}`}>{status}</span></div>
    </aside>
    <div className="ops-workspace">
      <header className="ops-topbar"><div className="ops-account"><span className="ops-eyebrow">Signed-in account</span><span>{user.email}</span></div><div className="ops-actions"><button onClick={() => void refresh()} disabled={pending || signingOut || sessionExpired || keyState === 'loading' || receiptState === 'loading'}><RefreshCw size={14} />Refresh</button><Link href="/dashboard?section=receipts#verify">Run verify</Link><Link className="ops-primary" href="/get-your-api-key">Create API key</Link></div></header>
      <main className="ops-content">
        <div className="ops-title"><div><h1>{section === 'api-keys' ? 'API Keys' : section === 'receipts' ? 'Receipts' : 'Operations'}</h1><p className="ops-eyebrow">Your account · authenticated API requests</p></div><span className="ops-muted">Refresh to check the latest records</span></div>
        {(keyError || receiptError) && <div role="alert" className="ops-warning"><strong>Account data could not be fully loaded.</strong>{keyError && <p>API keys: {keyError}</p>}{receiptError && <p>Receipts: {receiptError}</p>}<Link href={`/sign-in?next=${encodeURIComponent(`/dashboard?section=${section}`)}`}>Sign in again</Link></div>}
        <div className="ops-metrics">
          <Metric label="Verification receipts" value={receiptState === 'ready' ? String(receipts.length) : '—'} note="Latest 50 returned by your account" />
          <Metric label="Active API keys" value={keyState === 'ready' ? String(activeKeys.length) : '—'} note="Read and verify access" />
          <Metric label="Needs attention" value={receiptState === 'ready' ? String(attention) : '—'} note="Among the loaded receipts" />
          <Metric label="Account API access" value={status} note="Key and receipt requests only" />
        </div>
        {!sessionExpired && !signingOut && <DocumentReceiptPanel onSessionExpired={expireSession} />}
        {section !== 'receipts' && <div className="ops-panels">
          <Panel title="API keys" subtitle="Application access · read / verify" action={<KeyRound size={18} />}>
            {keyState === 'loading' && <p className="ops-muted">Loading keys…</p>}
            {keyState === 'ready' && keys.length === 0 && <p className="ops-muted">No API keys yet. Create your first key below.</p>}
            <ul className="ops-key-list">{keys.map((key) => <li key={key.id}><div><strong>{key.name}</strong><code>{key.key_prefix}…</code><small>Created {date(key.created_at)}</small></div><div><span className={`ops-badge ${key.revoked_at ? '' : 'ops-good'}`}>{key.revoked_at ? 'Revoked' : 'Active'}</span>{!key.revoked_at && <button disabled={pending || signingOut || keyState !== 'ready'} onClick={() => void revoke(key)}>Revoke</button>}</div></li>)}</ul>
            <form onSubmit={createKey} className="ops-form"><label htmlFor="key-name">Key name</label><div className="ops-input-row"><input id="key-name" value={keyName} onChange={(event) => setKeyName(event.target.value)} placeholder="My application" minLength={3} maxLength={64} required disabled={pending || signingOut} /><button className="ops-primary" disabled={pending || signingOut || keyState !== 'ready'}>{pending ? 'Working…' : 'Create key'}</button></div><p className="ops-muted">Keep the key on your server. Never include it in public code.</p></form>
            {actionError && <p className="ops-error" role="alert">{actionError}</p>}
            {createdKey && <div className="ops-secret" role="status"><strong>Save this key now — it will not be shown again.</strong><code>{createdKey.secret}</code><div className="ops-actions"><button onClick={() => void copySecret()}>Copy key</button><button onClick={() => { setCreatedKey(null); setCopyMessage(''); }}>I saved it — hide key</button></div>{copyMessage && <p>{copyMessage}</p>}</div>}
          </Panel>
          <Panel title="Physical attestations" subtitle="NFC tags · not connected"><ShieldCheck className="ops-placeholder-icon" size={32} /><h3>No tag feed connected</h3><p className="ops-muted">This console does not yet expose tag provisioning or scan history. No sample tags or status readings are shown.</p><Link className="ops-text-link" href="/docs">View documentation →</Link></Panel>
          <Panel title="Anchor & registry status" subtitle="Status reported on account receipts"><ul className="ops-health-list"><li><span>Receipt history</span><span className="ops-badge">{receiptState === 'ready' ? 'Loaded' : receiptState === 'loading' ? 'Checking' : 'Unavailable'}</span></li><li><span>Chain-level monitoring</span><span className="ops-badge">Not connected</span></li><li><span>Registry monitoring</span><span className="ops-badge">Not connected</span></li></ul><p className="ops-muted">Each receipt’s stored anchor status appears in the ledger below. Loading a record is not a fresh cryptographic verification.</p></Panel>
        </div>}
        <Panel title="Verification receipt ledger" subtitle="Account-scoped records · latest 50">
          <div className="ops-ledger-tools"><label htmlFor="receipt-search">Search receipts</label><input id="receipt-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Receipt ID, status or anchor…" /><span className="ops-muted">{receiptState === 'ready' ? `${selectedReceipts.length} of ${receipts.length} loaded` : 'Records unavailable until loaded'}</span></div>
          <div className="ops-table-scroll"><table><thead><tr><th>Receipt ID</th><th>Stored status</th><th>Anchor status</th><th>Created</th><th>Action</th></tr></thead><tbody>{selectedReceipts.map((receipt) => <tr key={receipt.receiptId}><td><code>{receipt.receiptId}</code></td><td><span className="ops-badge">{receipt.revoked ? 'revoked' : receipt.status}</span></td><td>{receipt.anchorStatus}</td><td>{date(receipt.createdAt)}</td><td><a href="#verify" onClick={() => { setReceiptId(receipt.receiptId); clearVerification(); }}>Verify</a></td></tr>)}</tbody></table></div>
          {receiptState === 'loading' && <p className="ops-empty">Loading receipts…</p>}
          {receiptState === 'ready' && selectedReceipts.length === 0 && <p className="ops-empty">{receipts.length ? 'No receipts match your search.' : 'No receipts are available for this account yet.'}</p>}
          <p className="ops-muted">Document fingerprint receipts appear above. This ledger contains receipts from the supported verification API.</p>
        </Panel>
        <div id="verify" className="ops-verify"><Panel title="Verify a receipt" subtitle="Recheck a receipt owned by your account"><form className="ops-form" onSubmit={verify}><label htmlFor="verify-receipt-id">Receipt ID</label><div className="ops-input-row"><input id="verify-receipt-id" value={receiptId} onChange={(event) => { setReceiptId(event.target.value); clearVerification(); }} placeholder="Receipt UUID" required /><button disabled={verifying || signingOut || receiptState !== 'ready' || !receiptId.trim()} className="ops-primary">{verifying ? 'Verifying…' : 'Run verify'}</button></div></form>{verifyError && <p className="ops-error" role="alert">{verifyError}</p>}{verification && <div className={verification.result.verified ? 'ops-result' : 'ops-warning'} role="status"><strong>{verification.result.verified ? 'Verification passed' : 'Verification did not pass'}</strong><p><code>{verification.id}</code></p><p>Signature: {verification.result.signatureStatus} · {verification.result.revoked ? 'Revoked' : 'Not revoked'}</p><p className="ops-hash">Stored hash: <code>{verification.result.storedHash}</code></p></div>}</Panel></div>
      </main>
    </div>
  </div>;
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return <div className="ops-metric"><strong>{value}</strong><p className="ops-eyebrow">{label}</p><small>{note}</small></div>;
}
