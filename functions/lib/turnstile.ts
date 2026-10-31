// Cloudflare Turnstile server-side verification. Dependency-free (no `Env`
// coupling) so it can be reused from any Pages Function or standalone
// Worker, matching the pattern in functions/lib/aerodatabox.ts.

const SITEVERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

interface SiteverifyResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
}

/**
 * Verifies a Turnstile response token against Cloudflare's siteverify
 * endpoint. Tokens are single-use — a token that was already redeemed
 * (e.g. a retried request) comes back as `success: false` with
 * `timeout-or-duplicate`, which this function reports like any other
 * failure so callers fail closed.
 */
export async function verifyTurnstileToken(
  secret: string,
  token: string,
  remoteIp: string | null
): Promise<boolean> {
  if (!token) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set('remoteip', remoteIp);

  const res = await fetch(SITEVERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) return false;

  const data = (await res.json()) as SiteverifyResponse;
  return data.success === true;
}
