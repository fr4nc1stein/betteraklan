import { FlightsResponseData } from '@/types/flights';

import { fetchWithCache } from './api';

/** Client-cached (5 min) read of the server-cached (6 h) flight schedule. */
export async function fetchFlightsData(): Promise<FlightsResponseData> {
  return fetchWithCache<FlightsResponseData>('/api/flights');
}

/**
 * Bypasses the client-side cache only — still served from the server's KV
 * cache underneath, never triggers a fresh AeroDataBox call. Safe to expose
 * as a user-facing "Refresh" action.
 */
export async function refetchFlightsData(): Promise<FlightsResponseData> {
  const response = await fetch('/api/flights');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}
