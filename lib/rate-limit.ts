type Entry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, Entry>();

export function enforceRateLimit(params: {
  key: string;
  max: number;
  windowMs: number;
}) {
  const now = Date.now();
  const current = store.get(params.key);

  if (!current || current.resetAt <= now) {
    store.set(params.key, {
      count: 1,
      resetAt: now + params.windowMs,
    });
    return { ok: true, remaining: params.max - 1, resetAt: now + params.windowMs };
  }

  if (current.count >= params.max) {
    return { ok: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  store.set(params.key, current);
  return { ok: true, remaining: params.max - current.count, resetAt: current.resetAt };
}
