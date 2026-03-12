export const ENGINE_REPO_URL = "https://github.com/TrustSignal-dev/TrustSignal";
export const EVALUATOR_ENTRY_URL = `${ENGINE_REPO_URL}/blob/master/docs/partner-eval/start-here.md`;
export const TRY_THE_API_URL = `${ENGINE_REPO_URL}/blob/master/docs/partner-eval/try-the-api.md`;

export const ARTIFACT_LINKS = [
  {
    title: "Evaluator Start Here",
    href: EVALUATOR_ENTRY_URL,
    description: "Canonical repo-side entry point for partner engineers."
  },
  {
    title: "OpenAPI Contract",
    href: `${ENGINE_REPO_URL}/blob/master/openapi.yaml`,
    description: "Public verification lifecycle contract."
  },
  {
    title: "Examples Directory",
    href: `${ENGINE_REPO_URL}/tree/master/examples`,
    description: "Request, response, receipt, and status payloads."
  },
  {
    title: "Postman Collection",
    href: `${ENGINE_REPO_URL}/blob/master/postman/TrustSignal.postman_collection.json`,
    description: "Local evaluator requests with environment variables."
  },
  {
    title: "Try The API",
    href: TRY_THE_API_URL,
    description: "Copy-paste API evaluation path using the public contract."
  },
  {
    title: "Developer Trial Demo",
    href: `${ENGINE_REPO_URL}/tree/master/demo`,
    description: "Local artifact to receipt to later verification walkthrough."
  }
] as const;

export const DEVELOPER_JOURNEY = [
  "Problem",
  "Verification Lifecycle",
  "Try The API",
  "API Example",
  "Developer Docs"
] as const;

export const LIFECYCLE_STEPS = [
  {
    title: "Submit Artifact",
    description: "The external workflow sends an artifact-derived verification request through the TrustSignal API boundary."
  },
  {
    title: "Verification Result",
    description: "TrustSignal returns verification signals that summarize the verification outcome for downstream workflow logic."
  },
  {
    title: "Signed Receipt",
    description: "The system issues a signed verification receipt that binds the verification outcome and verifiable provenance."
  },
  {
    title: "Store Receipt",
    description: "The workflow stores the receipt with its own record so the system of record retains the integrity-layer output."
  },
  {
    title: "Later Verification",
    description: "Before audit review or another high-trust step, the workflow can request later verification against stored receipt state."
  },
  {
    title: "Tamper Detection",
    description: "If the artifact or stored state has drifted, later verification returns a mismatch signal instead of silently reusing the earlier result."
  }
] as const;

export const CURL_EXAMPLE = `curl -X POST "https://api.trustsignal.dev/api/v1/verify" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: $TRUSTSIGNAL_API_KEY" \\
  --data @examples/verification-request.json`;

export const VERIFICATION_RESPONSE = `{
  "receiptVersion": "2.0",
  "decision": "ALLOW",
  "reasons": ["receipt issued"],
  "receiptId": "623e0b54-87b3-42b7-bc89-65fae0ad8d5e",
  "receiptHash": "0x4e7f2ce9d3f7a8d3b0e4c9f2aa17fd59d6b4fda2d7b7b7d1cce8124d7ee39d04",
  "receiptSignature": {
    "alg": "EdDSA",
    "kid": "trustsignal-current",
    "signature": "eyJleGFtcGxlIjoic2lnbmVkLXJlY2VpcHQifQ"
  },
  "anchor": {
    "status": "PENDING",
    "subjectDigest": "0x8c0f95cda31274e7b61adfd1dd1e0c03a4b96f78d90da52d42fd93d9a38fc112",
    "subjectVersion": "trustsignal.anchor_subject.v1"
  },
  "revocation": {
    "status": "ACTIVE"
  }
}`;

export const RECEIPT_EXAMPLE = `{
  "receiptVersion": "2.0",
  "receiptId": "623e0b54-87b3-42b7-bc89-65fae0ad8d5e",
  "createdAt": "2026-03-12T15:24:01.000Z",
  "policyProfile": "CONTROL_CC_001",
  "inputsCommitment": "0x2dded9c1b5c4c6d91df58a1b1793cb527f2b0cf5ddaf447f5b7d9839f7ab7d01",
  "checks": [
    {
      "checkId": "registry.status",
      "status": "PASS",
      "details": "Source responded with a current record"
    }
  ],
  "decision": "ALLOW",
  "reasons": ["receipt issued"],
  "receiptHash": "0x4e7f2ce9d3f7a8d3b0e4c9f2aa17fd59d6b4fda2d7b7b7d1cce8124d7ee39d04"
}`;

export const STATUS_EXAMPLE = `{
  "verified": true,
  "integrityVerified": true,
  "signatureVerified": true,
  "signatureStatus": "verified",
  "proofVerified": false,
  "recomputedHash": "0x4e7f2ce9d3f7a8d3b0e4c9f2aa17fd59d6b4fda2d7b7b7d1cce8124d7ee39d04",
  "storedHash": "0x4e7f2ce9d3f7a8d3b0e4c9f2aa17fd59d6b4fda2d7b7b7d1cce8124d7ee39d04",
  "inputsCommitment": "0x2dded9c1b5c4c6d91df58a1b1793cb527f2b0cf5ddaf447f5b7d9839f7ab7d01",
  "receiptSignature": {
    "alg": "EdDSA",
    "kid": "trustsignal-current"
  },
  "revoked": false
}`;

export const TAMPERED_REJECTION = `{
  "verified": false,
  "integrityVerified": false,
  "signatureVerified": true,
  "signatureStatus": "verified",
  "recomputedHash": "0x7d02a6e4f5cbfd616cb50cbeeaec4d37c78f5fc0bd385b0ecff7af9afbd4ab11",
  "storedHash": "0x4e7f2ce9d3f7a8d3b0e4c9f2aa17fd59d6b4fda2d7b7b7d1cce8124d7ee39d04",
  "revoked": false,
  "error": "artifact_mismatch"
}`;
