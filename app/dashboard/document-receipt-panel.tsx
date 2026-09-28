'use client';
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { DashboardSessionError } from '@/lib/dashboard-api';
import { documentReportFilename, documentReportJson, loadDocumentReport } from '@/lib/document-report';
import { fileMetadata, receiptPresentation, type ArtifactObservation } from '@/lib/document-receipt-status';
import { ArtifactReceiptView } from './artifact-receipt-view';
import { SavedReceiptStatus } from './saved-receipt-status';
import {
  fingerprintFile, issueDocumentReceipt, listDocumentReceipts, readDocumentReceipt,
  type DocumentEnvelope, type DocumentSummary,
} from '@/lib/document-receipts';

export function DocumentReceiptPanel({ onSessionExpired, initialReceiptId }: { onSessionExpired: () => void; initialReceiptId?: string }) {
  const [selected, setSelected] = useState<{ name: string; sha256: string; sizeBytes: number; requestId: string } | null>(null);
  const [receipt, setReceipt] = useState<DocumentEnvelope | null>(null);
  const [history, setHistory] = useState<DocumentSummary[]>([]);
  const [busy, setBusy] = useState(false);
  const [checkingReceipt, setCheckingReceipt] = useState(Boolean(initialReceiptId));
  const [error, setError] = useState('');
  const [listError, setListError] = useState('');
  const [artifact, setArtifact] = useState<ArtifactObservation>();
  const artifactFile = useRef<File | null>(null);
  const [loaded, setLoaded] = useState(false);
  const generation = useRef(0);
  const locked = useRef(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const compareInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    let cancelled = false;
    if (initialReceiptId) {
      const current = ++generation.current;
      locked.current = true; setBusy(true); setCheckingReceipt(true);
      setReceipt(null); setArtifact(undefined); artifactFile.current = null; setError('');
      void readDocumentReceipt(initialReceiptId).then(value => { if (!cancelled) setReceipt(value); }).catch(problem => {
        if (cancelled) return;
        if (problem instanceof DashboardSessionError) onSessionExpired();
        else setError(receiptPresentation(null).message);
      }).finally(() => {
        if (!cancelled && current === generation.current) {
          locked.current = false; setBusy(false); setCheckingReceipt(false);
        }
      });
      return () => { cancelled = true; generation.current += 1; locked.current = false; setBusy(false); setCheckingReceipt(false); };
    }
    void listDocumentReceipts().then((rows) => {
      if (!cancelled) {
        // A slow initial read must not erase a receipt issued while it was in flight.
        setHistory((current) => [...current, ...rows.filter((row) => !current.some((item) => item.receiptId === row.receiptId))]
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 50));
        setLoaded(true);
      }
    }).catch((problem) => {
      if (cancelled) return;
      if (problem instanceof DashboardSessionError) onSessionExpired();
      else setListError('Document receipt history could not be loaded.');
    });
    return () => { cancelled = true; generation.current += 1; locked.current = false; setBusy(false); setCheckingReceipt(false); };
  }, [onSessionExpired, initialReceiptId]);
  function fail(problem: unknown) {
    if (problem instanceof DashboardSessionError) onSessionExpired();
    else setError(problem instanceof Error && !problem.message.startsWith('[') ? problem.message : 'The receipt could not be confirmed. Please retry.');
  }
  async function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    const current = ++generation.current;
    setSelected(null); setReceipt(null); setArtifact(undefined); artifactFile.current = null; setError('');
    if (!file) return;
    locked.current = true; setBusy(true);
    try {
      const fingerprint = await fingerprintFile(file);
      if (current === generation.current) {
        setSelected({ name: file.name, ...fingerprint, requestId: crypto.randomUUID() });
        artifactFile.current = file;
      }
    } catch (problem) { if (current === generation.current) fail(problem); }
    finally { if (current === generation.current) { locked.current = false; setBusy(false); } }
  }
  async function issue(event: FormEvent) {
    event.preventDefault();
    if (!selected || locked.current) return;
    locked.current = true; setBusy(true); setError(''); setReceipt(null); setArtifact(undefined);
    const current = generation.current;
    try {
      const result = await issueDocumentReceipt({ sha256: selected.sha256, sizeBytes: selected.sizeBytes, requestId: selected.requestId });
      if (current !== generation.current) return;
      setReceipt(result);
      setArtifact({ sha256: selected.sha256, sizeBytes: selected.sizeBytes, ...(artifactFile.current ? fileMetadata(artifactFile.current) : {}) });
      setHistory((rows) => [{ receiptId: result.receipt.receiptId, createdAt: result.receipt.createdAt, revoked: result.revoked }, ...rows.filter((row) => row.receiptId !== result.receipt.receiptId)].slice(0, 50));
      setLoaded(true); setListError('');
    } catch (problem) { if (current === generation.current) fail(problem); }
    finally { if (current === generation.current) { locked.current = false; setBusy(false); } }
  }
  async function openReceipt(id: string) {
    if (locked.current) return;
    locked.current = true; setBusy(true); setReceipt(null); setArtifact(undefined); artifactFile.current = null; setError(''); setSelected(null);
    setCheckingReceipt(true);
    if (fileInput.current) fileInput.current.value = '';
    if (compareInput.current) compareInput.current.value = '';
    const current = ++generation.current;
    try { const result = await readDocumentReceipt(id); if (current === generation.current) setReceipt(result); }
    catch (problem) { if (current === generation.current) fail(problem); }
    finally { if (current === generation.current) { locked.current = false; setBusy(false); setCheckingReceipt(false); } }
  }
  async function compareFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setArtifact(undefined); artifactFile.current = null;
    if (!file || !receipt || locked.current) return;
    const receiptId = receipt.receipt.receiptId;
    // Retire the old result before revalidation; failure must not leave it downloadable.
    setReceipt(null);
    locked.current = true; setBusy(true); setError('');
    const current = generation.current;
    try {
      const results = await Promise.allSettled([fingerprintFile(file), readDocumentReceipt(receiptId)]);
      if (current !== generation.current) return;
      const expired = results.find((result) => result.status === 'rejected' && result.reason instanceof DashboardSessionError);
      if (expired?.status === 'rejected') throw expired.reason;
      const [fileResult, receiptResult] = results;
      if (fileResult.status === 'rejected') throw fileResult.reason;
      if (receiptResult.status === 'rejected') throw receiptResult.reason;
      const fingerprint = fileResult.value;
      const fresh = receiptResult.value;
      setReceipt(fresh);
      artifactFile.current = file;
      setArtifact({ ...fingerprint, ...fileMetadata(file) });
    } catch (problem) { if (current === generation.current) fail(problem); }
    finally { if (current === generation.current) { locked.current = false; setBusy(false); } }
  }
  async function download(format: 'json' | 'pdf') {
    if (!receipt || locked.current) return;
    const receiptId = receipt.receipt.receiptId;
    const current = generation.current;
    locked.current = true; setBusy(true); setError(''); setReceipt(null); setArtifact(undefined);
    try {
      const file = artifactFile.current;
      const freshArtifact = file ? { ...await fingerprintFile(file), ...fileMetadata(file) } : undefined;
      const report = await loadDocumentReport(receiptId, {
        localReview: ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname),
        artifact: freshArtifact,
      });
      if (current !== generation.current) return;
      const blob = format === 'json'
        ? new Blob([documentReportJson(report)], { type: 'application/json' })
        : new Blob([await (await import('@/lib/document-report-pdf')).renderDocumentReportPdf(report)], { type: 'application/pdf' });
      if (current !== generation.current) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = documentReportFilename(report, format);
      link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      setReceipt(report);
      setArtifact(freshArtifact);
    } catch (problem) { if (current === generation.current) fail(problem); }
    finally { if (current === generation.current) { locked.current = false; setBusy(false); } }
  }
  const presentation = receiptPresentation(receipt, artifact);
  return <section className="ops-panel ops-document-panel" id="upload-document">
    {!initialReceiptId && <>
    <div className="ops-panel-heading"><div><h2>Upload a document</h2><p className="ops-eyebrow">Create a signed fingerprint receipt</p></div></div>
    <p>Your file stays on this device. Only its SHA-256 fingerprint and size are sent to TrustSignal.</p>
    <form onSubmit={issue} className="ops-form">
      <label htmlFor="document-file">Choose a document — any file type, up to 25 MiB</label>
      <input ref={fileInput} id="document-file" type="file" onChange={(event) => void selectFile(event)} disabled={busy} />
      {selected && <p className="ops-hash">{selected.name} · {selected.sizeBytes.toLocaleString()} bytes<br /><code>{selected.sha256}</code></p>}
      <button className="ops-primary" disabled={busy || !selected}>{busy ? 'Working…' : 'Get receipt'}</button>
    </form>
    <p className="ops-muted">Records a fingerprint and issue time. It does not certify the document’s contents, origin, or compliance.</p>
    </>}
    {error && <p role="alert" className="ops-error">{error}</p>}
    {initialReceiptId && error && <button type="button" disabled={busy} onClick={() => void openReceipt(initialReceiptId)}>Retry verification</button>}
    {(checkingReceipt || receipt || error) && <SavedReceiptStatus value={receipt} checking={checkingReceipt} unavailable={Boolean(error)} />}
    {receipt && <div className={presentation.status === 'VERIFIED MATCH' ? 'ops-result' : 'ops-warning'}>
      {initialReceiptId ? <ArtifactReceiptView receipt={receipt} artifact={artifact} /> : <>
        <strong>{presentation.status === 'NOT CHECKED' ? 'Document not checked' : presentation.status}</strong>
        <p><code>{receipt.receipt.receiptId}</code> · {new Date(receipt.receipt.createdAt).toLocaleString()}</p>
        <p className="ops-hash">SHA-256: <code>{receipt.document.sha256}</code></p>
        <p>{presentation.message}</p>
        {presentation.environmentMessage && <p><strong>{presentation.environment === 'Sandbox' ? 'SANDBOX RECEIPT' : 'ENVIRONMENT UNCONFIRMED'}</strong><br />{presentation.environmentMessage}</p>}
        <p className="ops-muted">Fraud assessment: not performed. Export a machine-readable JSON report or a matching PDF with the JSON attached.</p>
      </>}
      <div className="ops-actions">
        <button type="button" onClick={() => void download('json')} disabled={busy}>Download JSON report</button>
        <button type="button" onClick={() => void download('pdf')} disabled={busy}>Download PDF report</button>
      </div>
      <div className="ops-form"><label htmlFor="compare-document">Check a file against this receipt</label><input ref={compareInput} id="compare-document" type="file" disabled={busy} onChange={(event) => void compareFile(event)} /></div>
    </div>}
    {!initialReceiptId && <>
    <h3>Your document receipts</h3>
    <p className="ops-muted">Latest 50. Select a receipt to recheck its signature, download it, or compare a file.</p>
    {listError && <p role="alert" className="ops-error">{listError}</p>}
    {!loaded && !listError && <p>Loading document receipts…</p>}
    {loaded && !history.length && <p>No document receipts yet.</p>}
    <ul className="ops-key-list">{history.map((row) => <li key={row.receiptId}><div><code>{row.receiptId}</code><small>{new Date(row.createdAt).toLocaleString()}</small></div><button disabled={busy} onClick={() => void openReceipt(row.receiptId)}>{row.revoked ? 'View revoked receipt' : 'Open receipt'}</button></li>)}</ul>
    </>}
  </section>;
}
