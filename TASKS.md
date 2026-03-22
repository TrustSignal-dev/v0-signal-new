# TrustSignal Discoverability Tasks

This checklist tracks the GitHub and public-surface work needed to reinforce
the TrustSignal brand across search, repository metadata, and security-facing
artifacts.

## Completed In This Repo

- [x] Homepage title updated to `TrustSignal | Evidence Integrity Infrastructure for Compliance Workflows`
- [x] Homepage meta description updated to TrustSignal-first messaging
- [x] Organization JSON-LD added to the root document head
- [x] Main repository `README.md` rewritten as a landing-page style overview
- [x] `SECURITY.md` added
- [x] `/.well-known/security.txt` added under `public/.well-known/security.txt`
- [x] Org profile README draft added at `.github/profile/README.md`
- [x] Public security page updated to point to `/.well-known/security.txt`

## Manual GitHub Actions

These items require GitHub org or repository settings access and cannot be
completed from this repo alone.

### 1. Canonical Org Identity

- [ ] Confirm the canonical org slug is `TrustSignal-dev`
- [ ] Set org display name to `TrustSignal`
- [ ] Set org website to `https://trustsignal.dev`
- [ ] Set org bio to:

`Evidence integrity infrastructure for compliance workflows. Signed verification receipts for audit-ready provenance.`

### 2. Main Repo Metadata

- [ ] Ensure the primary public repo is `TrustSignal-dev/TrustSignal`
- [ ] Use the main repo README as the canonical GitHub landing page
- [ ] Set the repo homepage URL to `https://trustsignal.dev`
- [ ] Set a concise repo description aligned with the homepage metadata

Suggested description:

`Evidence integrity infrastructure for compliance workflows. Signed verification receipts for audit-ready provenance.`

### 3. GitHub Topics

- [ ] Add these topics to each relevant public repo:

`evidence-integrity`, `compliance`, `audit`, `signed-receipts`, `provenance`, `integrity`, `verification`, `soc2`, `trustsignal`, `compliance-automation`

### 4. Org-Level .github Repository

- [ ] Create a public repository named exactly `.github` in the `TrustSignal-dev` org
- [ ] Add `profile/README.md`
- [ ] Use the draft from this repo at `.github/profile/README.md`

### 5. Pinned Repositories

- [ ] Pin exactly six public repos that best represent the product
- [ ] Include the main TrustSignal repo
- [ ] Include the public docs/review repo
- [ ] Include any GitHub Action or integration repo that demonstrates product maturity

### 6. Release Cadence

- [ ] Start creating GitHub releases with real release notes
- [ ] Use semantic tags such as `v0.1.0`, `v0.2.0`
- [ ] Write a short paragraph in each release describing what changed and why it matters

## Suggested GitHub CLI Commands

These are ready once `gh auth login` has been completed in an environment with
GitHub API access.

```bash
gh repo edit TrustSignal-dev/TrustSignal \
  --homepage "https://trustsignal.dev" \
  --description "Evidence integrity infrastructure for compliance workflows. Signed verification receipts for audit-ready provenance."
```

```bash
gh repo edit TrustSignal-dev/TrustSignal \
  --add-topic evidence-integrity \
  --add-topic compliance \
  --add-topic audit \
  --add-topic signed-receipts \
  --add-topic provenance \
  --add-topic integrity \
  --add-topic verification \
  --add-topic soc2 \
  --add-topic trustsignal \
  --add-topic compliance-automation
```

## Verification Notes

Local browser verification completed on March 20, 2026 against the Next.js dev
server:

- Homepage title matched the required TrustSignal-first string
- Homepage meta description matched the required copy
- Organization JSON-LD rendered with the TrustSignal name and canonical URLs
- `/.well-known/security.txt` rendered successfully
