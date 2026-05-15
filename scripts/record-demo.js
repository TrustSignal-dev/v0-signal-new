const fs = require("node:fs/promises");
const path = require("node:path");

const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const { chromium } = require("playwright");

const BASE_URL = "https://trustsignal.dev";
const VIEWPORT = { width: 1920, height: 1080 };
const SLOW_MO = 600;

const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const GITHUB_PASSWORD = process.env.GITHUB_PASSWORD;
const GITHUB_OTP = process.env.GITHUB_OTP;

const ROOT_DIR = path.resolve(__dirname, "..");
const OUTPUT_DIR = path.join(ROOT_DIR, "output");
const VIDEO_TMP_DIR = path.join(OUTPUT_DIR, ".video-tmp");
const FINAL_VIDEO_PATH = path.join(OUTPUT_DIR, "trustsignal-demo.webm");
const TEST_PDF_PATH = path.join(ROOT_DIR, "scripts", "test-document.pdf");

async function ensureTestPdf(pdfPath) {
  try {
    await fs.access(pdfPath);
    return;
  } catch {
    // File does not exist; generate a small one-page PDF.
  }

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  page.drawText("TrustSignal Demo Test Document", {
    x: 60,
    y: 760,
    size: 24,
    font,
    color: rgb(0.12, 0.12, 0.12),
  });

  page.drawText("This one-page PDF is used for receipt generation in the Playwright demo.", {
    x: 60,
    y: 720,
    size: 12,
    font,
    color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText(`Created at: ${new Date().toISOString()}`, {
    x: 60,
    y: 700,
    size: 10,
    font,
    color: rgb(0.35, 0.35, 0.35),
  });

  const bytes = await pdf.save();
  await fs.writeFile(pdfPath, bytes);
}

function requiredEnv(name, value) {
  if (!value || !value.trim()) {
    throw new Error(
      `${name} is required. Set ${name} before running demo:record.`,
    );
  }
  return value.trim();
}

function parseField(text, label) {
  const regex = new RegExp(`${label}:\\s*(.+)`);
  const match = text.match(regex);
  if (!match || !match[1]) {
    throw new Error(`Could not parse '${label}' from receipt block.`);
  }
  return match[1].trim();
}

async function run() {
  const ghUsername = GITHUB_USERNAME ? GITHUB_USERNAME.trim() : null;
  const ghPassword = GITHUB_PASSWORD ? GITHUB_PASSWORD.trim() : null;
  const ghOtp = GITHUB_OTP ? GITHUB_OTP.trim() : null;

  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.rm(VIDEO_TMP_DIR, { recursive: true, force: true });
  await fs.mkdir(VIDEO_TMP_DIR, { recursive: true });

  await ensureTestPdf(TEST_PDF_PATH);

  let browser;
  let context;
  let page;
  let tmpVideoPath;

  try {
    browser = await chromium.launch({
      headless: false,
      slowMo: SLOW_MO,
    });

    context = await browser.newContext({
      viewport: VIEWPORT,
      recordVideo: {
        dir: VIDEO_TMP_DIR,
        size: VIEWPORT,
      },
    });

    page = await context.newPage();

    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });

    const signInLink = page.locator('a[href="/sign-in"]').first();
    if (await signInLink.count()) {
      await signInLink.click();
    } else {
      await page.getByRole("link", { name: /sign in/i }).first().click();
    }

    await page.waitForURL("**/sign-in", { timeout: 30000 });

    // Click "Continue with GitHub" button on the sign-in page.
    await page.getByRole("button", { name: /continue with github/i }).click();

    // GitHub OAuth redirect — wait for github.com to load.
    await page.waitForURL(/github\.com\//, { timeout: 30000 });

    await page.locator("#login_field").fill(ghUsername ?? "");
    await page.locator("#password").fill(ghPassword ?? "");

    // If credentials were not pre-filled, wait up to 3 minutes for manual GitHub login + any 2FA.
    if (!ghUsername || !ghPassword) {
      console.log("No credentials set — waiting up to 3 minutes for manual GitHub login (including 2FA)...");
      await page.waitForURL(/trustsignal\.dev\/(dashboard|$)/, { timeout: 180000 });
    } else {
      await page.locator('input[type="submit"], button[type="submit"]').first().click();

      // Wait for either dashboard (no 2FA) or a GitHub 2FA page.
      await page.waitForURL(
        (url) => url.hostname === "trustsignal.dev" || /github\.com\/sessions\/two-factor/.test(url.href),
        { timeout: 30000 }
      );

      if (/github\.com\/sessions\/two-factor/.test(page.url())) {
        // 2FA screen appeared — could be webauthn, mobile, OTP, etc.
        if (ghOtp) {
          const otpSelectors = [
            'input[name="app_otp"]',
            'input[name="otp"]',
            'input[autocomplete="one-time-code"]',
          ];
          try {
            const otpInput = page.locator(otpSelectors.join(", ")).first();
            await otpInput.waitFor({ timeout: 5000 });
            await otpInput.fill(ghOtp);
            await page.locator('input[type="submit"], button[type="submit"]').first().click();
          } catch {
            // OTP input not found (e.g. webauthn/mobile) — fall through to manual wait.
          }
        }
        // Wait up to 2 minutes for manual 2FA completion (mobile tap, security key, etc.)
        console.log("GitHub 2FA detected — waiting up to 2 minutes for you to approve (tap GitHub Mobile, etc.)...");
        await page.waitForURL(/trustsignal\.dev\/dashboard/, { timeout: 120000 });
      }
    }
    await page.getByRole("heading", { name: /api keys/i }).waitFor({ timeout: 60000 });

    const uploadSection = page.locator("section", {
      hasText: "Document upload and receipt generation",
    });
    await uploadSection.waitFor({ timeout: 30000 });

    await uploadSection.locator('input[type="file"]').setInputFiles(TEST_PDF_PATH);
    await uploadSection.getByRole("button", { name: /generate receipt/i }).click();

    await page.getByText("Receipt generated successfully").waitFor({ timeout: 120000 });

    const receiptBlock = uploadSection.locator("div", {
      hasText: "Receipt generated successfully",
    });
    const receiptText = (await receiptBlock.textContent()) || "";

    const receiptId = parseField(receiptText, "Receipt ID");
    const hash = parseField(receiptText, "Hash");
    const timestamp = parseField(receiptText, "Timestamp");
    const anchor = parseField(receiptText, "Anchor");
    const status = parseField(receiptText, "Status");

    if (!/SECURE/i.test(status)) {
      throw new Error(`Expected SECURE status, got '${status}'.`);
    }

    const verifySection = page.locator("section", { hasText: "Receipt verification" });
    await verifySection.waitFor({ timeout: 30000 });
    await verifySection.getByPlaceholder("Receipt ID").fill(receiptId);
    await verifySection.getByRole("button", { name: /^Verify$/i }).click();

    const verifiedLine = verifySection.getByText(/Result:\s*VERIFIED/i);
    await verifiedLine.waitFor({ timeout: 120000 });

    console.log("Receipt details:");
    console.log(`- id: ${receiptId}`);
    console.log(`- hash: ${hash}`);
    console.log(`- timestamp: ${timestamp}`);
    console.log(`- anchor: ${anchor}`);
    console.log(`- status: ${status}`);

    await page.waitForTimeout(3000);

    await page.close();
    const pages = context.pages();
    for (const openPage of pages) {
      await openPage.close();
    }

    await context.close();
    await browser.close();

    // Discover and normalize recorded output file name.
    const files = await fs.readdir(VIDEO_TMP_DIR);
    const webm = files.find((name) => name.endsWith(".webm"));
    if (!webm) {
      throw new Error("Playwright did not produce a .webm video file.");
    }

    tmpVideoPath = path.join(VIDEO_TMP_DIR, webm);
    await fs.copyFile(tmpVideoPath, FINAL_VIDEO_PATH);

    const stats = await fs.stat(FINAL_VIDEO_PATH);
    console.log(`Video saved: ${FINAL_VIDEO_PATH}`);
    console.log(`Video size: ${stats.size} bytes`);
  } catch (error) {
    if (context) {
      try {
        await context.close();
      } catch {
        // Ignore cleanup failures.
      }
    }
    if (browser) {
      try {
        await browser.close();
      } catch {
        // Ignore cleanup failures.
      }
    }
    throw error;
  }
}

run().catch((error) => {
  console.error("Demo recording failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
