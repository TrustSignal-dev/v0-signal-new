const LOCAL_API_URL = "http://127.0.0.1:3001";

export function getTrustSignalApiUrl() {
  const configured =
    process.env.TRUSTSIGNAL_API_URL?.trim() ||
    process.env.TRUSTSIGNAL_API_BASE_URL?.trim();

  if (!configured) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("TRUSTSIGNAL_API_URL is required in production");
    }
    return LOCAL_API_URL;
  }

  return configured.replace(/\/$/, "");
}
