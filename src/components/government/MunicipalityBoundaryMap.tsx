import { useEffect, useMemo } from 'react';

import type { Feature, FeatureCollection } from 'geojson';
import L from 'leaflet';
import type { PathOptions } from 'leaflet';
import { GeoJSON, MapContainer, TileLayer, useMap } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';

import { getMunicipalityColor } from '@/lib/municipalityColors';

import municipalitiesBoundaries from '@/data/geo/municipalities-boundaries.json';

interface MunicipalityBoundaryMapProps {
  /** Simple slug, e.g. "altavas" — without the "municipality-of-" prefix */
  slug: string;
  className?: string;
}

/**
 * The surrounding SidebarLayout finishes its collapse/expand transition
 * (500ms) after Leaflet has already measured its container, leaving stale
 * tile bounds. Re-measure once that transition settles.
 */
function InvalidateSizeOnSettle() {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 600);
    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

export function MunicipalityBoundaryMap({
  slug,
  className,
}: MunicipalityBoundaryMapProps) {
  const boundaries = municipalitiesBoundaries as FeatureCollection;
  const feature = useMemo(
    () =>
      boundaries.features.find(
        f => (f.properties as { slug: string }).slug === slug
      ),
    [boundaries, slug]
  );

  const bounds = useMemo(
    () => (feature ? L.geoJSON(feature as Feature).getBounds() : null),
    [feature]
  );

  if (!feature || !bounds) return null;

  const color = getMunicipalityColor(slug);
  const pathOptions: PathOptions = {
    weight: 2,
    color,
    fillColor: color,
    fillOpacity: 0.35,
  };

  return (
    <div className={className}>
      <MapContainer
        bounds={bounds}
        boundsOptions={{ padding: [24, 24] }}
        scrollWheelZoom={false}
        className='h-full w-full'
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <GeoJSON data={feature as Feature} style={pathOptions} />
        <InvalidateSizeOnSettle />
      </MapContainer>
    </div>
  );
}
