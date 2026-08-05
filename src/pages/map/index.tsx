import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { formatDistanceToNow } from 'date-fns';
import type { Feature, FeatureCollection } from 'geojson';
import L from 'leaflet';
import type { Layer, PathOptions } from 'leaflet';
import {
  GeoJSON,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';

import { PageHero } from '@/components/layout/PageLayouts';
import { Card } from '@/components/ui/Card';

import { getMunicipalityColor } from '@/lib/municipalityColors';
import { fetchAllMunicipalitiesWeather, MunicipalityWeather } from '@/lib/weather';

import municipalityCentroids from '@/data/geo/municipality-centroids.json';
import municipalitiesBoundaries from '@/data/geo/municipalities-boundaries.json';

interface MunicipalityProperties {
  slug: string;
  name: string;
}

interface Centroid {
  slug: string;
  name: string;
  lat: number;
  lon: number;
}

type ViewMode = 'boundaries' | 'weather';

const WEATHER_EMOJI: Record<string, string> = {
  Sun: '☀️',
  Moon: '🌙',
  CloudSun: '⛅',
  CloudMoon: '🌜',
  Cloud: '☁️',
  CloudDrizzle: '🌦️',
  CloudRain: '🌧️',
  CloudLightning: '⛈️',
  CloudSnow: '🌨️',
};
const getWeatherEmoji = (iconName: string) => WEATHER_EMOJI[iconName] ?? '☁️';

function weatherMarkerIcon(temp: number, iconName: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div class="bg-kapwa-bg-surface border-kapwa-border-weak text-kapwa-text-strong flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold shadow-md whitespace-nowrap">
      <span>${getWeatherEmoji(iconName)}</span><span>${Math.round(temp)}°</span>
    </div>`,
    iconSize: [56, 24],
    iconAnchor: [28, 12],
  });
}

/** Lives inside MapContainer to get access to the map instance for flyTo. */
function MapController({
  flyToTarget,
}: {
  flyToTarget: { lat: number; lon: number } | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (!flyToTarget) return;
    map.flyTo([flyToTarget.lat, flyToTarget.lon], 12, { duration: 1 });
  }, [flyToTarget, map]);
  return null;
}

function getPathOptions(mode: ViewMode) {
  return (feature?: Feature): PathOptions => {
    if (mode === 'weather') {
      return {
        weight: 1,
        color: '#94a3b8',
        fillColor: '#cbd5e1',
        fillOpacity: 0.12,
        className: 'pointer-events-none',
      };
    }
    const slug = (feature?.properties as MunicipalityProperties | undefined)
      ?.slug;
    const color = getMunicipalityColor(slug ?? '');
    return {
      weight: 1.5,
      color,
      fillColor: color,
      fillOpacity: 0.45,
      className:
        'hover:fill-kapwa-bg-brand-default cursor-pointer transition-colors duration-200',
    };
  };
}

export default function MapPage() {
  const navigate = useNavigate();
  const boundaries = municipalitiesBoundaries as FeatureCollection;
  const centroids = municipalityCentroids as Centroid[];
  const municipalities = [...boundaries.features].sort((a, b) =>
    (a.properties as MunicipalityProperties).name.localeCompare(
      (b.properties as MunicipalityProperties).name
    )
  );
  const sortedCentroids = [...centroids].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const [viewMode, setViewMode] = useState<ViewMode>('boundaries');
  const [weatherData, setWeatherData] = useState<Record<
    string,
    MunicipalityWeather
  > | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherFetchedAt, setWeatherFetchedAt] = useState<Date | null>(null);
  const [jumpSlug, setJumpSlug] = useState('');
  const [flyToTarget, setFlyToTarget] = useState<{
    lat: number;
    lon: number;
  } | null>(null);

  useEffect(() => {
    if (viewMode !== 'weather' || weatherData) return;
    setWeatherLoading(true);
    fetchAllMunicipalitiesWeather()
      .then(data => {
        setWeatherData(data);
        setWeatherFetchedAt(new Date());
      })
      .finally(() => setWeatherLoading(false));
  }, [viewMode, weatherData]);

  const goToMunicipality = (slug: string) =>
    navigate(`/government/municipalities/municipality-of-${slug}`);

  const onEachFeature = (feature: Feature, layer: Layer) => {
    if (viewMode !== 'boundaries') return;
    const props = feature.properties as MunicipalityProperties;
    layer.bindTooltip(props.name, { sticky: true, direction: 'top' });
    layer.on('click', () => goToMunicipality(props.slug));
  };

  const handleJump = (slug: string) => {
    setJumpSlug(slug);
    const centroid = centroids.find(c => c.slug === slug);
    if (centroid) setFlyToTarget({ lat: centroid.lat, lon: centroid.lon });
  };

  return (
    <div className='animate-in fade-in space-y-6 duration-500'>
      <PageHero
        title='Map of Aklan'
        description='An interactive map of all 17 municipalities of the Province of Aklan. Switch to Weather to see live conditions everywhere at once, or click a municipality to view its government profile.'
      />

      <div className='flex flex-wrap items-center gap-3'>
        <select
          aria-label='Map view mode'
          value={viewMode}
          onChange={e => setViewMode(e.target.value as ViewMode)}
          className='border-kapwa-border-weak bg-kapwa-bg-surface text-kapwa-text-strong rounded-md border px-3 py-2 text-sm'
        >
          <option value='boundaries'>Municipal Boundaries</option>
          <option value='weather'>Weather</option>
        </select>

        <select
          aria-label='Jump to municipality'
          value={jumpSlug}
          onChange={e => handleJump(e.target.value)}
          className='border-kapwa-border-weak bg-kapwa-bg-surface text-kapwa-text-strong rounded-md border px-3 py-2 text-sm'
        >
          <option value=''>Jump to municipality…</option>
          {sortedCentroids.map(c => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>

        {viewMode === 'weather' && weatherFetchedAt && (
          <span className='text-kapwa-text-muted text-xs'>
            Updated{' '}
            {formatDistanceToNow(weatherFetchedAt, { addSuffix: true })}
          </span>
        )}
      </div>

      <Card className='overflow-hidden p-0' hover={false}>
        <div className='relative h-[70vh] w-full'>
          {viewMode === 'weather' && weatherLoading && (
            <div className='bg-kapwa-bg-surface/70 absolute inset-0 z-[1000] flex items-center justify-center'>
              <span className='text-kapwa-text-muted text-sm'>
                Loading weather…
              </span>
            </div>
          )}
          <MapContainer
            center={[11.75, 122.2]}
            zoom={10}
            scrollWheelZoom
            className='h-full w-full'
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />
            <GeoJSON
              key={viewMode}
              data={boundaries}
              style={getPathOptions(viewMode)}
              onEachFeature={onEachFeature}
            />
            {viewMode === 'weather' &&
              weatherData &&
              centroids.map(c => {
                const w = weatherData[c.slug];
                if (!w) return null;
                return (
                  <Marker
                    key={c.slug}
                    position={[c.lat, c.lon]}
                    icon={weatherMarkerIcon(w.temperature, w.icon)}
                  >
                    <Tooltip direction='top' offset={[0, -8]}>
                      {c.name}: {Math.round(w.temperature)}°C, {w.condition}
                    </Tooltip>
                    <Popup>
                      <div className='space-y-1 text-sm'>
                        <p className='font-semibold'>{c.name}</p>
                        <p className='capitalize'>
                          {Math.round(w.temperature)}°C — {w.condition}
                        </p>
                        <p className='text-xs text-gray-500'>
                          Humidity {w.humidity}% · Wind {w.windSpeed} m/s
                        </p>
                        <button
                          type='button'
                          onClick={() => goToMunicipality(c.slug)}
                          className='text-xs font-medium text-blue-600 hover:underline'
                        >
                          View municipality →
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            <MapController flyToTarget={flyToTarget} />
          </MapContainer>
        </div>
      </Card>

      {/* Quick list — accessible fallback for imprecise map clicks */}
      <div className='grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'>
        {municipalities.map(f => {
          const props = f.properties as MunicipalityProperties;
          return (
            <button
              key={props.slug}
              type='button'
              onClick={() => goToMunicipality(props.slug)}
              className='border-kapwa-border-weak bg-kapwa-bg-surface hover:border-kapwa-border-brand hover:text-kapwa-text-brand text-kapwa-text-support flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors'
            >
              <span
                className='h-2.5 w-2.5 shrink-0 rounded-full'
                style={{ backgroundColor: getMunicipalityColor(props.slug) }}
                aria-hidden='true'
              />
              <span className='truncate'>{props.name}</span>
            </button>
          );
        })}
      </div>

      <p className='text-kapwa-text-disabled text-center text-xs italic'>
        Municipal boundaries via{' '}
        <a
          href='https://www.openstreetmap.org/copyright'
          target='_blank'
          rel='noreferrer'
          className='text-kapwa-text-brand not-italic hover:underline'
        >
          OpenStreetMap
        </a>{' '}
        contributors, ODbL-licensed. Weather via OpenWeatherMap.
      </p>
    </div>
  );
}
