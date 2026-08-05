export interface TourismEntry {
  name: string | null;
  description: string;
}

export interface MunicipalityTourism {
  slug: string;
  name: string;
  festivals: TourismEntry[];
  attractions: TourismEntry[];
  products: TourismEntry[];
}

export interface FeaturedAttraction {
  id: number;
  name: string;
  found: boolean;
  address: string;
  latitude: number;
  longitude: number;
  google_maps_link: string;
  notes: string;
  searched: boolean;
}

// Source: aklan.gov.ph's "Authorized Accommodation Establishments" listings
// (mainland + Boracay). Only name/address are published; lat/lon are
// generated once via scripts/data-prep/geocode-accommodations.py (Nominatim),
// with `geocodePrecision` recording how precise that placement is since
// informal PH addresses don't always resolve exactly.
export type GeocodePrecision = 'exact' | 'barangay' | 'municipality' | 'failed';

export interface Accommodation {
  name: string;
  address: string;
  area: 'mainland' | 'boracay';
  municipality: string | null;
  lat: number | null;
  lon: number | null;
  geocodePrecision: GeocodePrecision;
}
