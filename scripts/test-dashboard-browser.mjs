// Synthetic localhost browser regression proof. Start the disposable fixture first.
// No personal browser profile, hosted identity, or real API key is used.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const base = 'http://127.0.0.1:3317';
const out = process.argv[2];
if (!out) throw new Error('Provide a local evidence output directory.');
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
const response = { verified: true, integrityVerified: true, signatureVerified: true, proofVerified: true, revoked: false, signatureStatus: 'verified', storedHash: 'synthetic-hash-only' };
const receiptA = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const receiptB = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const paint = (page) => page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));

async function login(page) {
  await page.goto(`${base}/get-your-api-key`);
  await page.locator('input[name="email"]').fill('synthetic@example.test');
  await page.locator('input[name="password"]').fill('synthetic-password-only');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.waitForURL('**/dashboard?section=api-keys');
  await page.getByRole('button', { name: 'Create key', exact: true }).waitFor();
  await page.waitForFunction(() => !document.querySelector('#key-name')?.closest('form')?.querySelector('button')?.disabled);
}

async function run(name, fn, viewport = { width: 1440, height: 1000 }) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  try {
    await login(page);
    await fn(page);
    results.push({ name, result: 'PASS' });
  } catch (error) {
    results.push({ name, result: 'FAIL', error: error.message });
  } finally {
    await context.close();
  }
  console.log(`${results.at(-1).result}: ${name}`);
}

function hold(page, pattern, status, json) {
  let release;
  let arrived;
  let delivered;
  const gate = new Promise((resolve) => { release = resolve; });
  const started = new Promise((resolve) => { arrived = resolve; });
  const completed = new Promise((resolve) => { delivered = resolve; });
  page.route(pattern, async (route) => {
    arrived();
    await gate;
    await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(json) }).catch(() => {});
    delivered();
  });
  return { release, started, completed };
}

try {
  for (const action of ['refresh', 'create', 'revoke', 'verify']) {
    await run(`expired session clears plaintext and account data during ${action}`, async (page) => {
      await page.getByLabel('Key name').fill(`Synthetic expiry ${action}`);
      await page.getByRole('button', { name: 'Create key', exact: true }).click();
      await page.getByText('Save this key now — it will not be shown again.').waitFor();
      const unauthorized = (route) => route.fulfill({ status: 401, body: '{}' });
      if (action === 'refresh') {
        await page.route('**/api/keys', unauthorized);
        await page.getByRole('button', { name: 'Refresh', exact: true }).click();
      } else if (action === 'create') {
        await page.route('**/api/keys', unauthorized);
        await page.getByLabel('Key name').fill('Synthetic second key');
        await page.getByRole('button', { name: 'Create key', exact: true }).click();
      } else if (action === 'revoke') {
        await page.route('**/api/keys/*/revoke', unauthorized);
        page.once('dialog', (dialog) => dialog.accept());
        await page.locator('.ops-key-list li').filter({ hasText: `Synthetic expiry ${action}` }).getByRole('button', { name: 'Revoke', exact: true }).click();
      } else {
        await page.route('**/api/receipts/*/verify', unauthorized);
        await page.getByLabel('Receipt ID', { exact: true }).fill(receiptA);
        await page.getByRole('button', { name: 'Run verify', exact: true }).click();
      }
      await page.getByText('Account data could not be fully loaded.').waitFor();
      assert.equal(await page.getByRole('button', { name: 'Copy key', exact: true }).count(), 0);
      assert.equal(await page.getByText('synthetic-only-not-a-real-api-key', { exact: true }).count(), 0);
      assert.equal(await page.locator('.ops-key-list li').count(), 0);
      assert.equal(await page.locator('.ops-table-scroll tbody tr').count(), 0);
      assert.equal(await page.getByRole('button', { name: 'Refresh', exact: true }).isDisabled(), true);
    });
  }

  await run('discard verification response after receipt input changes', async (page) => {
    const gate = hold(page, '**/api/receipts/*/verify', 200, response);
    await page.getByLabel('Receipt ID', { exact: true }).fill(receiptA);
    await page.getByRole('button', { name: 'Run verify', exact: true }).click();
    await gate.started;
    await page.getByLabel('Receipt ID', { exact: true }).fill(receiptB);
    gate.release();
    await gate.completed;
    await paint(page);
    assert.equal(await page.getByText('Verification passed', { exact: true }).count(), 0);
  });

  await run('refresh clears previous successful verification during outage', async (page) => {
    await page.getByLabel('Receipt ID', { exact: true }).fill(receiptA);
    await page.getByRole('button', { name: 'Run verify', exact: true }).click();
    await page.getByText('Verification passed', { exact: true }).waitFor();
    await page.route('**/api/keys', (route) => route.fulfill({ status: 503, body: '{}' }));
    await page.route('**/api/receipts', (route) => route.fulfill({ status: 503, body: '{}' }));
    await page.getByRole('button', { name: 'Refresh', exact: true }).click();
    await page.getByText('Account data could not be fully loaded.').waitFor();
    assert.equal(await page.getByText('Verification passed', { exact: true }).count(), 0);
    assert.equal(await page.getByRole('button', { name: 'Create key', exact: true }).isDisabled(), true);
    await page.screenshot({ path: `${out}/outage.png`, fullPage: true });
  });

  await run('key creation excludes competing refresh', async (page) => {
    const gate = hold(page, '**/api/keys', 201, { key: { id: receiptB, name: 'Synthetic held key', key_prefix: 'synthetic', scopes: ['read', 'verify'], created_at: '2026-09-26T00:00:00Z', last_used_at: null, revoked_at: null, plaintext: 'synthetic-only-not-a-real-key' } });
    await page.getByLabel('Key name').fill('Synthetic held key');
    await page.getByRole('button', { name: 'Create key', exact: true }).click();
    await gate.started;
    const disabled = await page.getByRole('button', { name: 'Refresh', exact: true }).isDisabled();
    gate.release();
    assert.equal(disabled, true);
  });

  await run('late key creation cannot redisplay a secret after logout begins', async (page) => {
    const creation = hold(page, '**/api/keys', 201, { key: { id: receiptB, name: 'Synthetic logout key', key_prefix: 'synthetic', scopes: ['read', 'verify'], created_at: '2026-09-26T00:00:00Z', last_used_at: null, revoked_at: null, plaintext: 'synthetic-only-not-a-real-key' } });
    const logout = hold(page, '**/api/auth/logout', 500, { error: 'synthetic_outage' });
    await page.getByLabel('Key name').fill('Synthetic logout key');
    await page.getByRole('button', { name: 'Create key', exact: true }).click();
    await creation.started;
    await page.getByRole('button', { name: 'Sign out', exact: true }).click();
    await logout.started;
    creation.release();
    await creation.completed;
    await paint(page);
    const secrets = await page.locator('.ops-secret').count();
    logout.release();
    assert.equal(secrets, 0);
    await page.getByText('Sign out failed. Please try again.').waitFor();
  });

  await run('failed logout waits for pending revoke before recovery reload', async (page) => {
    await page.getByLabel('Key name').fill('Synthetic recovery key');
    await page.getByRole('button', { name: 'Create key', exact: true }).click();
    await page.getByText('Save this key now — it will not be shown again.').waitFor();
    await page.getByRole('button', { name: 'I saved it — hide key', exact: true }).click();
    let release;
    let arrived;
    let delivered;
    let routeFailed = false;
    const gate = new Promise((resolve) => { release = resolve; });
    const started = new Promise((resolve) => { arrived = resolve; });
    const completed = new Promise((resolve) => { delivered = resolve; });
    await page.route('**/api/keys/*/revoke', async (route) => {
      arrived();
      await gate;
      try {
        const result = await route.fetch();
        await route.fulfill({ response: result });
      } catch { routeFailed = true; }
      finally { delivered(); }
    });
    await page.route('**/api/auth/logout', (route) => route.fulfill({ status: 500, body: '{}' }));
    const row = page.locator('.ops-key-list li').filter({ hasText: 'Synthetic recovery key' }).first();
    page.once('dialog', (dialog) => dialog.accept());
    await row.getByRole('button', { name: 'Revoke', exact: true }).click();
    await started;
    await page.getByRole('button', { name: 'Sign out', exact: true }).click();
    await page.getByText('Sign out failed. Please try again.').waitFor();
    await paint(page);
    const locked = await page.getByRole('button', { name: 'Refresh', exact: true }).isDisabled();
    release();
    await completed;
    assert.equal(routeFailed, false, 'The synthetic revoke request must complete');
    assert.equal(locked, true, 'Recovery must retain the pending mutation lock');
    await row.getByText('Revoked', { exact: true }).waitFor();
  });

  await run('mobile key creation, cancel and confirm revoke, and navigation', async (page) => {
    await page.getByLabel('Key name').fill('Synthetic mobile key');
    await page.getByRole('button', { name: 'Create key', exact: true }).click();
    await page.getByText('Save this key now — it will not be shown again.').waitFor();
    assert.equal(await page.evaluate(() => JSON.stringify(localStorage).includes('synthetic-only-not-a-real-api-key') || JSON.stringify(sessionStorage).includes('synthetic-only-not-a-real-api-key')), false);
    await page.getByRole('button', { name: 'I saved it — hide key', exact: true }).click();
    const row = page.locator('.ops-key-list li').filter({ hasText: 'Synthetic mobile key' }).first();
    page.once('dialog', (dialog) => dialog.dismiss());
    await row.getByRole('button', { name: 'Revoke', exact: true }).click();
    assert.equal(await row.getByText('Active', { exact: true }).count(), 1);
    page.once('dialog', (dialog) => dialog.accept());
    await row.getByRole('button', { name: 'Revoke', exact: true }).click();
    await row.getByText('Revoked', { exact: true }).waitFor();
    assert.equal(await row.getByRole('button', { name: 'Revoke', exact: true }).count(), 0);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), true);
    await page.screenshot({ path: `${out}/mobile-revoked.png`, fullPage: true });
    await page.getByRole('navigation', { name: 'Dashboard navigation' }).getByRole('link', { name: 'Receipts', exact: true }).click();
    await page.getByRole('heading', { name: 'Receipts', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Sign out', exact: true }).click();
    await page.waitForURL('**/sign-in');
    await page.goto(`${base}/dashboard`);
    await page.waitForURL('**/sign-in?next=*');
  }, { width: 390, height: 844 });
} finally {
  await browser.close();
  await writeFile(`${out}/browser-results.json`, JSON.stringify(results, null, 2));
}
if (results.some((result) => result.result !== 'PASS')) process.exitCode = 1;
