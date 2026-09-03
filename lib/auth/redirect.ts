const DEFAULT_AUTH_DESTINATION = "/dashboard";
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;

export function sanitizeNextPath(value: string | null | undefined): string {
  if (!value || value !== value.trim()) return DEFAULT_AUTH_DESTINATION;
  if (!value.startsWith("/") || value.startsWith("//")) return DEFAULT_AUTH_DESTINATION;
  if (value.includes("\\") || CONTROL_CHARACTER_PATTERN.test(value)) {
    return DEFAULT_AUTH_DESTINATION;
  }

  try {
    const base = new URL("https://trustsignal.invalid");
    const destination = new URL(value, base);
    if (destination.origin !== base.origin) return DEFAULT_AUTH_DESTINATION;
    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return DEFAULT_AUTH_DESTINATION;
  }
}
