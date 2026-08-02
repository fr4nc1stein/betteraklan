// Flight Schedule API - Path: functions/api/flights.ts
// Serves Kalibo & Caticlan (Boracay) airport schedules from AeroDataBox,
// cached in KV. AeroDataBox's free tier is capped at 600 units/month and
// each 12h-window airport-schedule call costs 2 units, so this is fetched
// on a long cache TTL rather than per-request — see CACHE_TTL_SECONDS.
import type { Env } from '../types';

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

const AIRPORTS = [
  { slug: 'kalibo', icao: 'RPVK', iata: 'KLO', name: 'Kalibo International Airport' },
  {
    slug: 'caticlan',
    icao: 'RPVE',
    iata: 'MPH',
    name: 'Godofredo P. Ramos Airport (Caticlan / Boracay)',
  },
] as const;

const CACHE_KEY = 'aklan_flights';
// 4 refreshes/day x 4 units (2 airports x 2 units) = 16 units/day
// ~480 units/month, safely under AeroDataBox's 600/month free cap.
const CACHE_TTL_SECONDS = 6 * 60 * 60;
// AeroDataBox caps the schedule window at 12 hours per call.
const LOOKBACK_HOURS = 2;
const LOOKAHEAD_HOURS = 10;

interface AeroDataBoxAirportRef {
  icao?: string;
  iata?: string;
  name?: string;
}

interface AeroDataBoxFlightLeg {
  airport?: AeroDataBoxAirportRef;
  scheduledTime?: { utc?: string; local?: string };
  revisedTime?: { utc?: string; local?: string };
  terminal?: string;
}

interface AeroDataBoxFlight {
  departure?: AeroDataBoxFlightLeg;
  arrival?: AeroDataBoxFlightLeg;
  number?: string;
  status?: string;
  airline?: { name?: string };
}

interface AeroDataBoxScheduleResponse {
  departures?: AeroDataBoxFlight[];
  arrivals?: AeroDataBoxFlight[];
}

export interface NormalizedFlight {
  direction: 'departure' | 'arrival';
  flightNumber: string;
  airline: string;
  status: string;
  scheduledLocal: string | null;
  revisedLocal: string | null;
  terminal: string | null;
  otherAirport: { iata: string; name: string } | null;
}

export interface AirportSchedule {
  slug: string;
  icao: string;
  iata: string;
  name: string;
  flights: NormalizedFlight[];
}

export interface FlightsResponseData {
  updatedAt: string;
  airports: AirportSchedule[];
}

const MANILA_TIME_FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Manila',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

// AeroDataBox's schedule endpoint treats this "local-naive" timestamp as
// wall-clock time AT THE AIRPORT (Asia/Manila) — not UTC. Both Kalibo and
// Caticlan are in that same timezone, so this is correct for both.
function toApiTimestamp(date: Date): string {
  const parts = MANILA_TIME_FORMATTER.formatToParts(date);
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? '00';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

function normalizeFlights(
  data: AeroDataBoxScheduleResponse
): NormalizedFlight[] {
  const departures = (data.departures ?? []).map(
    (f): NormalizedFlight => ({
      direction: 'departure',
      flightNumber: f.number ?? 'Unknown',
      airline: f.airline?.name ?? 'Unknown',
      status: f.status ?? 'Unknown',
      scheduledLocal: f.departure?.scheduledTime?.local ?? null,
      revisedLocal: f.departure?.revisedTime?.local ?? null,
      terminal: f.departure?.terminal ?? null,
      otherAirport: f.arrival?.airport
        ? {
            iata: f.arrival.airport.iata ?? '',
            name: f.arrival.airport.name ?? '',
          }
        : null,
    })
  );

  const arrivals = (data.arrivals ?? []).map(
    (f): NormalizedFlight => ({
      direction: 'arrival',
      flightNumber: f.number ?? 'Unknown',
      airline: f.airline?.name ?? 'Unknown',
      status: f.status ?? 'Unknown',
      scheduledLocal: f.arrival?.scheduledTime?.local ?? null,
      revisedLocal: f.arrival?.revisedTime?.local ?? null,
      terminal: f.arrival?.terminal ?? null,
      otherAirport: f.departure?.airport
        ? {
            iata: f.departure.airport.iata ?? '',
            name: f.departure.airport.name ?? '',
          }
        : null,
    })
  );

  // AeroDataBox (with withCodeshared=true) can return the same physical
  // flight twice under identical numbers — dedupe on direction + number +
  // scheduled time before sorting.
  const seen = new Set<string>();
  const deduped = [...departures, ...arrivals].filter(f => {
    const key = `${f.direction}|${f.flightNumber}|${f.scheduledLocal}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return deduped.sort((a, b) =>
    (a.scheduledLocal ?? '').localeCompare(b.scheduledLocal ?? '')
  );
}

// null return = fetch failed; caller falls back to the last known-good
// data for this airport instead of overwriting it with an empty result.
async function fetchAirportSchedule(
  airport: (typeof AIRPORTS)[number],
  apiKey: string
): Promise<AirportSchedule | null> {
  const now = new Date();
  const from = new Date(now.getTime() - LOOKBACK_HOURS * 60 * 60 * 1000);
  const to = new Date(now.getTime() + LOOKAHEAD_HOURS * 60 * 60 * 1000);

  const url =
    `https://aerodatabox.p.rapidapi.com/flights/airports/icao/${airport.icao}/` +
    `${toApiTimestamp(from)}/${toApiTimestamp(to)}` +
    `?withLeg=true&direction=Both&withCancelled=true&withCodeshared=true&withCargo=false&withPrivate=false&withLocation=false`;

  const response = await fetch(url, {
    headers: {
      'x-rapidapi-host': 'aerodatabox.p.rapidapi.com',
      'x-rapidapi-key': apiKey,
    },
  });

  if (!response.ok) {
    console.error(
      `AeroDataBox request failed for ${airport.icao}: ${response.status} ${response.statusText}`
    );
    return null;
  }

  const data = (await response.json()) as AeroDataBoxScheduleResponse;
  return { ...airport, flights: normalizeFlights(data) };
}

async function fetchAllSchedules(
  env: Env,
  previous: FlightsResponseData | null
): Promise<FlightsResponseData> {
  const apiKey = env.AERODATABOX_API_KEY;
  if (!apiKey) {
    throw new Error('AeroDataBox API key not found in environment variables');
  }

  // AeroDataBox's free tier is rate-limited to 1 request/second — 150ms
  // was too fast and caused the second airport to get a 429.
  const airports: AirportSchedule[] = [];
  for (const airport of AIRPORTS) {
    const result = await fetchAirportSchedule(airport, apiKey);
    if (result) {
      airports.push(result);
    } else {
      const lastKnownGood = previous?.airports.find(
        a => a.slug === airport.slug
      );
      airports.push(lastKnownGood ?? { ...airport, flights: [] });
    }
    await new Promise(resolve => setTimeout(resolve, 1100));
  }

  return { updatedAt: new Date().toISOString(), airports };
}

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
    // No public cache-bypass: this endpoint is unauthenticated, and
    // AeroDataBox's free tier is capped at 600 units/month, so freshness
    // is governed solely by CACHE_TTL_SECONDS, not by request params.
    //
    // Stored without expirationTtl (KV would otherwise hard-delete the
    // entry, leaving nothing to fall back to). Staleness is judged from
    // the payload's own `updatedAt` instead, so a fetch failure for one
    // airport can fall back to its last known-good data rather than an
    // expired cache forcing an empty result to be shown.
    const cached = (await context.env.WEATHER_KV.get(CACHE_KEY, {
      type: 'json',
    })) as FlightsResponseData | null;

    if (cached) {
      const ageSeconds = (Date.now() - new Date(cached.updatedAt).getTime()) / 1000;
      if (ageSeconds < CACHE_TTL_SECONDS) {
        return new Response(JSON.stringify(cached), {
          headers: {
            'Content-Type': 'application/json',
            ...getCorsHeaders(origin),
            'Cache-Control': `max-age=${CACHE_TTL_SECONDS}`,
          },
        });
      }
    }

    const data = await fetchAllSchedules(context.env, cached);

    context.waitUntil(
      context.env.WEATHER_KV.put(CACHE_KEY, JSON.stringify(data))
    );

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders(origin),
        'Cache-Control': `max-age=${CACHE_TTL_SECONDS}`,
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
