// Flight Schedule API - Path: functions/api/flights.ts
// Serves Kalibo & Caticlan (Boracay) airport schedules. Purely a KV read —
// the actual AeroDataBox fetching happens on a fixed schedule in the
// standalone cron Worker at workers/flights-refresh (see its README),
// which is the only thing that calls AeroDataBox. This handler only makes
// a live call itself as a one-time cold-start fallback, if the cache has
// genuinely never been populated yet.
import type { Env } from '../types';
import { fetchAllSchedules, FlightsResponseData } from '../lib/aerodatabox';

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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    };
  }

  return {
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

const CACHE_KEY = 'aklan_flights';

export async function onRequest(context: {
  request: Request;
  env: Env;
  waitUntil: (promise: Promise<unknown>) => void;
}): Promise<Response> {
  const url = new URL(context.request.url);
  const origin = url.origin;

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(origin) });
  }

  try {
    const cached = (await context.env.WEATHER_KV.get(CACHE_KEY, {
      type: 'json',
    })) as FlightsResponseData | null;

    // Normal path: the cron Worker keeps this fresh on a fixed schedule,
    // so a cache hit is served as-is, however "old" it looks — freshness
    // is that Worker's job, not this request's.
    if (cached) {
      return new Response(JSON.stringify(cached), {
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders(origin),
          'Cache-Control': 'max-age=3600',
        },
      });
    }

    // Cold-start fallback: cache has genuinely never been populated (e.g.
    // right after first deploy, before the cron Worker's first run). Do a
    // single live fetch to seed it — this should only ever happen once.
    const apiKey = context.env.AERODATABOX_API_KEY;
    if (!apiKey) {
      throw new Error('AeroDataBox API key not found in environment variables');
    }
    const data = await fetchAllSchedules(apiKey, null);

    context.waitUntil(context.env.WEATHER_KV.put(CACHE_KEY, JSON.stringify(data)));

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders(origin),
        'Cache-Control': 'max-age=3600',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders(origin),
      },
    });
  }
}
