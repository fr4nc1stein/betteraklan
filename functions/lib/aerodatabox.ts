// Shared AeroDataBox fetch/normalize logic — imported by both the Pages
// Function that serves cached data (functions/api/flights.ts) and the
// standalone cron Worker that refreshes it (workers/flights-refresh).
// Kept dependency-free (plain apiKey string, no Env coupling) so both
// deployables can import it identically.

export const AIRPORTS = [
  {
    slug: 'kalibo',
    icao: 'RPVK',
    iata: 'KLO',
    name: 'Kalibo International Airport',
  },
  {
    slug: 'caticlan',
    icao: 'RPVE',
    iata: 'MPH',
    name: 'Godofredo P. Ramos Airport (Caticlan / Boracay)',
  },
] as const;

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

function normalizeFlights(data: AeroDataBoxScheduleResponse): NormalizedFlight[] {
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

export async function fetchAllSchedules(
  apiKey: string,
  previous: FlightsResponseData | null
): Promise<FlightsResponseData> {
  // AeroDataBox's free tier is rate-limited to 1 request/second — 150ms
  // was too fast and caused the second airport to get a 429.
  const airports: AirportSchedule[] = [];
  for (const airport of AIRPORTS) {
    const result = await fetchAirportSchedule(airport, apiKey);
    if (result) {
      airports.push(result);
    } else {
      const lastKnownGood = previous?.airports.find(a => a.slug === airport.slug);
      airports.push(lastKnownGood ?? { ...airport, flights: [] });
    }
    await new Promise(resolve => setTimeout(resolve, 1100));
  }

  return { updatedAt: new Date().toISOString(), airports };
}
