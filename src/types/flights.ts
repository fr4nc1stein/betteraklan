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

export interface AirportInfo {
  slug: string;
  icao: string;
  iata: string;
  name: string;
  shortName?: string;
  municipality: string;
  municipalitySlug: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  elevationFeet: number;
  timezone: string;
  weatherCity: string;
}
