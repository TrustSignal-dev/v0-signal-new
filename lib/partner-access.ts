export const PARTNERS = ["drata", "ice"] as const;

export type PartnerSlug = (typeof PARTNERS)[number];

export const PARTNER_LABELS: Record<PartnerSlug, string> = {
  drata: "Drata",
  ice: "ICE Mortgage Technology",
};

const PARTNER_PASSWORD_ENV: Record<PartnerSlug, string> = {
  drata: "DRATA_PARTNER_PASSWORD",
  ice: "ICE_PARTNER_PASSWORD",
};

const PARTNER_COOKIE_NAMES: Record<PartnerSlug, string> = {
  drata: "drata_partner_access",
  ice: "ice_partner_access",
};

export function isPartnerSlug(value: string | null | undefined): value is PartnerSlug {
  return PARTNERS.includes(value as PartnerSlug);
}

export function getPartnerCookieName(partner: PartnerSlug) {
  return PARTNER_COOKIE_NAMES[partner];
}

function sha256(value: string) {
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function safeEqual(a: string, b: string) {
  const [left, right] = await Promise.all([sha256(a), sha256(b)]);
  const leftBytes = new Uint8Array(left);
  const rightBytes = new Uint8Array(right);

  let diff = 0;
  for (let index = 0; index < leftBytes.length; index += 1) {
    diff |= leftBytes[index] ^ rightBytes[index];
  }

  return diff === 0;
}

export async function verifyPartnerPassword(partner: PartnerSlug, password: string) {
  const expected = process.env[PARTNER_PASSWORD_ENV[partner]];
  if (!expected) return false;

  return safeEqual(expected, password);
}

function getSessionSecret() {
  // Shared HMAC secret for all partner-access session tokens.
  // Falls back to the legacy DRATA_ACCESS_HMAC_SECRET so existing Drata
  // deployments do not break while we transition.
  return (
    process.env.PARTNER_ACCESS_HMAC_SECRET ||
    process.env.DRATA_ACCESS_HMAC_SECRET ||
    ""
  );
}

async function signValue(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value)
  );

  return toHex(signature);
}

export async function createPartnerAccessToken(partner: PartnerSlug) {
  const secret = getSessionSecret();
  if (!secret) return "";

  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 60 * 60 * 12; // 12 hours
  const payload = JSON.stringify({ partner, iat, exp });
  const signature = await signValue(payload, secret);
  const base64Payload = Buffer.from(payload).toString("base64url");
  return `${base64Payload}.${signature}`;
}

export async function verifyPartnerAccessToken(
  partner: PartnerSlug,
  token: string | undefined
) {
  if (!token) return false;

  const secret = getSessionSecret();
  if (!secret) return false;

  const [base64Payload, signature] = token.split(".");
  if (!base64Payload || !signature) return false;

  const payloadText = Buffer.from(base64Payload, "base64url").toString("utf8");
  const expectedSignature = await signValue(payloadText, secret);

  if (!(await safeEqual(signature, expectedSignature))) {
    return false;
  }

  try {
    const payload = JSON.parse(payloadText);
    if (payload.partner !== partner) return false;
    
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && now > payload.exp) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}
