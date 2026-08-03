// Simple per-key daily counter backed by KV. Dependency-free, matching the
// pattern in functions/lib/aerodatabox.ts and functions/lib/turnstile.ts.
//
// KV is eventually consistent across Cloudflare's edge (writes can take up
// to ~60s to propagate globally), so a burst of near-simultaneous requests
// from the same identifier could briefly overshoot the limit. That's fine
// for abuse/cost control — this isn't meant to be a hard atomic guarantee.
export interface RateLimitResult {
  allowed: boolean;
  count: number;
  limit: number;
}

export async function checkAndIncrementDailyLimit(
  kv: KVNamespace,
  keyPrefix: string,
  identifier: string,
  limit: number
): Promise<RateLimitResult> {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
  const key = `${keyPrefix}:${identifier}:${date}`;

  const current = await kv.get(key);
  const count = current ? parseInt(current, 10) : 0;

  if (count >= limit) {
    return { allowed: false, count, limit };
  }

  // TTL is a generous safety buffer past the UTC day boundary, not the
  // reset mechanism — the date embedded in the key is what actually
  // resets the count daily, so exact expiry timing doesn't matter.
  await kv.put(key, String(count + 1), { expirationTtl: 172800 });
  return { allowed: true, count: count + 1, limit };
}
