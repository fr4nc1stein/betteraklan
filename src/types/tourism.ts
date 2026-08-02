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
