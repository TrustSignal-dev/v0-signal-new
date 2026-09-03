const DEFAULT_API_URL = "https://api.trustsignal.dev";

export function getTrustSignalApiUrl() {
  const configured =
    process.env.TRUSTSIGNAL_API_URL?.trim() ||
    process.env.TRUSTSIGNAL_API_BASE_URL?.trim() ||
    DEFAULT_API_URL;

  return configured.replace(/\/$/, "");
}
