// Standalone cron Worker — the only thing that ever calls AeroDataBox.
// Runs on a fixed schedule (see wrangler.jsonc `triggers.crons`), writes
// the result into the same WEATHER_KV namespace the main betteraklan
// Pages project reads from (functions/api/flights.ts). That endpoint is a
// pure cache read; this Worker owns all freshness/rate-limit/quota
// concerns, fully decoupled from site traffic.
import {
  fetchAllSchedules,
  FlightsResponseData,
} from '../../../functions/lib/aerodatabox';

interface Env {
  WEATHER_KV: KVNamespace;
  AERODATABOX_API_KEY: string;
}

const CACHE_KEY = 'aklan_flights';

async function refresh(env: Env): Promise<FlightsResponseData> {
  const previous = (await env.WEATHER_KV.get(CACHE_KEY, {
    type: 'json',
  })) as FlightsResponseData | null;

  const data = await fetchAllSchedules(env.AERODATABOX_API_KEY, previous);
  await env.WEATHER_KV.put(CACHE_KEY, JSON.stringify(data));
  return data;
}

export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    console.log('[flights-refresh] cron fired:', controller.cron);
    ctx.waitUntil(
      refresh(env).then(data => {
        console.log(
          '[flights-refresh] updated',
          data.airports
            .map(a => `${a.slug}:${a.flights.length} flights`)
            .join(', ')
        );
      })
    );
  },

  // Manual trigger for testing/ops — never linked from the public site.
  // Gated behind the same API key as a shared secret so a leaked/guessed
  // *.workers.dev URL can't be used to spam AeroDataBox.
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/refresh' && request.method === 'POST') {
      if (request.headers.get('x-refresh-token') !== env.AERODATABOX_API_KEY) {
        return new Response('Unauthorized', { status: 401 });
      }
      const data = await refresh(env);
      return new Response(JSON.stringify(data, null, 2), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(
      'betteraklan-flights-refresh: runs on a cron schedule. POST /refresh with an x-refresh-token header to trigger manually.',
      { status: 200 }
    );
  },
};
