const LOCAL_DEVELOPMENT_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/**
 * Returns the operator-controlled public origin when one is configured.
 *
 * Reverse proxies such as Cloud Run may present the container's internal host
 * in Request.url. Never rebuild this value from forwarded headers: those are
 * client-controlled unless every proxy hop is explicitly trusted.
 */
export function resolveTrustedAppOrigin(requestUrl: string): string {
  const requestOrigin = new URL(requestUrl).origin;
  const configuredOrigin = process.env.TRUSTSIGNAL_APP_ORIGIN?.trim();

  if (!configuredOrigin) {
    return requestOrigin;
  }

  const parsed = new URL(configuredOrigin);
  const hasUnexpectedComponents =
    Boolean(parsed.username) ||
    Boolean(parsed.password) ||
    Boolean(parsed.search) ||
    Boolean(parsed.hash) ||
    (parsed.pathname !== "" && parsed.pathname !== "/");

  if (hasUnexpectedComponents) {
    throw new Error("TRUSTSIGNAL_APP_ORIGIN must contain only an origin");
  }

  const isSecure = parsed.protocol === "https:";
  const isLocalDevelopment =
    parsed.protocol === "http:" && LOCAL_DEVELOPMENT_HOSTS.has(parsed.hostname);

  if (!isSecure && !isLocalDevelopment) {
    throw new Error("TRUSTSIGNAL_APP_ORIGIN must use HTTPS outside local development");
  }

  return parsed.origin;
}
