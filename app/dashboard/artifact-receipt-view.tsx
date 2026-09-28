import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { receiptPresentation, utcTime, type ArtifactObservation } from '@/lib/document-receipt-status';
import type { DocumentEnvelope } from '@/lib/document-receipts';
import './artifact-receipt.css';

export function ArtifactReceiptView({ receipt, artifact }: { receipt: DocumentEnvelope | null; artifact?: ArtifactObservation }) {
  const view = receiptPresentation(receipt, artifact);
  const Icon = view.tone === 'valid' ? CheckCircle2 : view.tone === 'error' ? XCircle : AlertTriangle;
  return <article className="receipt-report" aria-label="Artifact integrity receipt">
    <header className="receipt-header"><strong>TrustSignal</strong><div>ARTIFACT INTEGRITY RECEIPT<small>Receipt format v1.1</small></div></header>
    <div className={`receipt-status receipt-${view.tone}`} role="status">
      <h2><Icon aria-hidden size={24} />{view.status}</h2><p>{view.message}</p>
      {view.status === 'VERIFIED MATCH' && <small>Receipt signature valid · Receipt active</small>}
    </div>
    {view.environmentMessage && <aside className="receipt-environment"><strong>{view.environment === 'Sandbox' ? 'SANDBOX RECEIPT' : 'ENVIRONMENT UNCONFIRMED'}</strong><p>{view.environmentMessage}</p></aside>}
    {receipt && <>
      <section className="receipt-section"><h3>WHAT THIS RESULT MEANS</h3><p>{view.status === 'VERIFIED MATCH' ? 'The artifact supplied for verification matches the SHA-256 fingerprint recorded in this signed receipt.' : view.message}</p>
        {view.status === 'VERIFIED MATCH' && <p>TrustSignal verified the receipt signature and checked its current lifecycle status.</p>}
      </section>
      <section className="receipt-section"><h3>ARTIFACT AND RECEIPT</h3><dl className="receipt-metadata">
        <div><dt>Receipt ID</dt><dd>{receipt.receipt.receiptId}</dd></div><div><dt>Receipt status</dt><dd>{view.lifecycle}</dd></div>
        <div><dt>Receipt issued by TrustSignal</dt><dd>{utcTime(receipt.receipt.createdAt)}</dd></div>
        <div><dt>Verification response received</dt><dd>{receipt.verificationContext ? utcTime(receipt.verificationContext.checkedAt) : 'Not recorded'}</dd></div>
        <div><dt>Artifact type <small>(display metadata - not signed)</small></dt><dd>{artifact?.mediaType || 'Not supplied'}</dd></div>
        <div><dt>Artifact size</dt><dd>{receipt.document.sizeBytes.toLocaleString('en-US')} bytes</dd></div>
        <div><dt>Receipt profile</dt><dd>{receipt.receipt.policyProfile}</dd></div><div><dt>Environment</dt><dd>{view.environment}</dd></div>
      </dl></section>
      <section className="receipt-fingerprint"><h3>ARTIFACT FINGERPRINT <span>SHA-256</span></h3><code>{receipt.document.sha256}</code>
        <p>{view.status === 'VERIFIED MATCH' ? 'Calculated from the selected artifact bytes. Verification compares those bytes with the recorded fingerprint.' : 'Recorded artifact fingerprint. Verification compares the selected artifact against this value.'}</p>
      </section>
      <section className="receipt-section"><h3>VERIFICATION CHECKS</h3><dl className="receipt-checks">{view.checks.map(check => <div key={check.name}><dt>{check.name}</dt><dd><strong>{check.result}</strong><span>{check.meaning}</span></dd></div>)}</dl></section>
      <details className="receipt-section"><summary>Advanced verification details</summary><dl className="receipt-metadata">
        <div><dt>Signature algorithm</dt><dd>{view.signatureAlgorithm}</dd></div><div><dt>Signing key ID</dt><dd>{receipt.receipt.receiptSignature.kid}</dd></div>
        <div><dt>Receipt schema</dt><dd>{receipt.receipt.receiptVersion}</dd></div><div><dt>Canonicalization</dt><dd>RFC 8785 (JCS) / {receipt.receipt.policyProfile}</dd></div>
        <div className="receipt-wide"><dt>Signed receipt digest</dt><dd>{receipt.receipt.receiptHash}</dd></div>
      </dl><p>The signed receipt is included in the JSON package. Verification observations, artifact type, environment labels and this report are display metadata, not signed fields.</p>
        <p>The browser hashes the selected file. The service signs the submitted fingerprint; it does not inspect or store the raw file. Fraud assessment is not performed.</p>
      </details>
    </>}
    <p className="receipt-limitations">{view.claimBoundary}</p>
    <footer>{receipt && <a href={`/verify/${encodeURIComponent(receipt.receipt.receiptId)}`}>Verify this receipt in your private workspace</a>}<span>TrustSignal · Evidence integrity infrastructure</span></footer>
  </article>;
}
