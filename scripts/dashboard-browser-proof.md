# Synthetic dashboard browser proof

Use Node 22 and the existing project dependencies. This runs against a disposable
localhost auth/API fixture, using a fresh headless Chrome context. It does not use
a personal browser profile, hosted Supabase, real API keys, or production storage.

From this worktree, start the fixture in one terminal:

```powershell
node scripts/dashboard-browser-fixture.mjs
```

Then run the checks in a second terminal:

```powershell
node scripts/test-dashboard-browser.mjs node_modules/.cache/dashboard-browser-proof
```

The fixture binds ports 3317 and 3318 to 127.0.0.1. Stop it after the check.
The runner requires an installed Chrome executable. It writes a result JSON and
synthetic-only screenshots to the supplied local directory. It exits nonzero if
a scenario fails. The terminal output contains scenario names, not auth tokens.

Covered behavior: destination-preserving sign-in; late verification invalidation;
outage refresh clearing old success; refresh exclusion during key creation;
discarding key secrets after logout starts; mobile key creation/hiding; revoke
cancel/confirm; failed-logout recovery waiting for a pending revoke; receipt
navigation; logout and subsequent protected-route denial.

The external identity/API fixture returns synthetic responses. These checks do
not establish real token validation, database isolation, cryptographic proof,
provider setup, production signing custody, or a live repair.
