// Citizens Charter AI Chat - Path: functions/api/citizens-charter-chat.ts
// Backs the /chat page. Every message is gated by a Turnstile siteverify
// check (env.TURNSTILE_SECRET) and a per-IP daily cap before it's allowed
// to spend AI Search quota (env.AI_SEARCH_API_TOKEN / env.AI_SEARCH_INSTANCE)
// — AI Search beta has account-level quota limits, so this endpoint is the
// only thing that ever calls it; nothing AI-Search-related touches the
// client directly.
import type { Env } from '../types';
import { verifyTurnstileToken } from '../lib/turnstile';
import { queryCitizensCharter } from '../lib/aisearch';
import { checkAndIncrementDailyLimit } from '../lib/rateLimit';

const ALLOWED_ORIGINS = [
  'https://betteraklan.pages.dev',
  'https://www.betteraklan.org',
  'https://betteraklan.org',
  'http://localhost:5173',
  'http://localhost:8788',
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowed = origin && ALLOWED_ORIGINS.includes(origin);

  if (isAllowed) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    };
  }

  return {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function json(body: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...getCorsHeaders(origin) },
  });
}

const MAX_MESSAGE_LENGTH = 2000;
const DAILY_MESSAGE_LIMIT = 20;

// Kill switch: flip to true to re-enable. While false, this endpoint never
// reads Turnstile/AI Search config or touches KV — it's a hard stop before
// any of that, so it's safe to leave the secrets configured while this is
// off. Disabled while we settle on an abuse-prevention strategy before
// exposing this publicly (see src/pages/chat and the `citizensCharterChat`
// feature flag, which are disabled in lockstep with this).
const CHAT_ENABLED = false;

export async function onRequest(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const { request, env } = context;
  const origin = request.headers.get('Origin');

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(origin) });
  }

  if (!CHAT_ENABLED) {
    return json({ error: 'Chat is temporarily unavailable' }, 503, origin);
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405, origin);
  }

  let body: { message?: string; turnstileToken?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400, origin);
  }

  const message = body.message?.trim();
  const turnstileToken = body.turnstileToken;

  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    return json({ error: 'Invalid message' }, 400, origin);
  }
  if (!turnstileToken) {
    return json({ error: 'Missing verification token' }, 400, origin);
  }

  if (!env.TURNSTILE_SECRET) {
    return json({ error: 'Chat is not configured' }, 501, origin);
  }

  const remoteIp = request.headers.get('CF-Connecting-IP');
  const verified = await verifyTurnstileToken(
    env.TURNSTILE_SECRET,
    turnstileToken,
    remoteIp
  );
  if (!verified) {
    return json({ error: 'Verification failed' }, 403, origin);
  }

  const rateLimit = await checkAndIncrementDailyLimit(
    env.WEATHER_KV,
    'chat_rl',
    remoteIp || 'unknown',
    DAILY_MESSAGE_LIMIT
  );
  if (!rateLimit.allowed) {
    return json(
      {
        error: `You've reached today's limit of ${DAILY_MESSAGE_LIMIT} questions. Please try again tomorrow.`,
      },
      429,
      origin
    );
  }

  if (!env.AI_SEARCH_API_TOKEN || !env.AI_SEARCH_INSTANCE) {
    return json({ error: 'AI Search is not configured' }, 501, origin);
  }

  try {
    const result = await queryCitizensCharter(
      env.AI_SEARCH_INSTANCE,
      env.AI_SEARCH_API_TOKEN,
      message
    );
    return json(result, 200, origin);
  } catch (error) {
    return json({ error: (error as Error).message }, 502, origin);
  }
}
