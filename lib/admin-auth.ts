import { createHmac, timingSafeEqual } from "node:crypto";

const ADMIN_COOKIE_NAME = "trustsignal_admin_session";

function getAdminPassword() {
  const password = process.env.TRUSTSIGNAL_ADMIN_PASSWORD?.trim();
  if (!password) {
    throw new Error("TRUSTSIGNAL_ADMIN_PASSWORD is required for /admin");
  }
  return password;
}

function signValue(value: string) {
  return createHmac("sha256", getAdminPassword()).update(value).digest("hex");
}

export function createAdminSessionValue() {
  const issuedAt = Date.now().toString();
  return `${issuedAt}.${signValue(issuedAt)}`;
}

export function verifyAdminSessionValue(rawValue: string | undefined) {
  if (!rawValue) return false;
  const [issuedAt, signature] = rawValue.split(".", 2);
  if (!issuedAt || !signature) return false;

  const expected = signValue(issuedAt);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length) return false;

  const maxAgeMs = 1000 * 60 * 60 * 12;
  const issuedAtMs = Number.parseInt(issuedAt, 10);
  if (!Number.isFinite(issuedAtMs) || Date.now() - issuedAtMs > maxAgeMs) {
    return false;
  }

  return timingSafeEqual(actualBuffer, expectedBuffer);
}

export function validateAdminPassword(password: string) {
  const normalized = password.trim();
  if (!normalized) return false;

  const expected = Buffer.from(getAdminPassword());
  const actual = Buffer.from(normalized);
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

export const adminCookieName = ADMIN_COOKIE_NAME;
