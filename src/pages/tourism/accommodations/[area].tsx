import { useEffect, useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';

import { MapPinIcon, SearchIcon } from 'lucide-react';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/navigation/Breadcrumb';
import { Card, CardContent } from '@/components/ui/Card';
import { PaginationControls } from '@/components/ui/Pagination';

import accommodationsData from '@/data/tourism/accommodations.json';
import { Accommodation } from '@/types/tourism';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

type Area = 'mainland' | 'boracay';

const AREA_LABELS: Record<Area, string> = {
  mainland: 'Aklan Mainland',
  boracay: 'Boracay',
};
const AREA_CENTER: Record<Area, [number, number]> = {
  mainland: [11.75, 122.2],
  boracay: [11.965, 121.925],
};
const AREA_ZOOM: Record<Area, number> = {
  mainland: 10,
  boracay: 14,
};

function googleMapsUrl(lat: number, lon: number) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
}

function escapeHtml(s: string) {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return s.replace(/[&<>"']/g, c => map[c]);
}

type MappableAccommodation = Accommodation & { lat: number; lon: number };

interface CoordinateGroup {
  lat: number;
  lon: number;
  items: MappableAccommodation[];
}

/** Many published addresses only say e.g. "Station 1, Brgy. Balabag" with no
 * street/building detail, so geocoding — however accurate — collapses dozens
 * of establishments onto one point. Rather than let leaflet.markercluster
 * spiderfy those into a fan of fake individual positions, group them into a
 * single marker with a list popup: an honest representation of what the
 * source data can actually support. */
function groupByCoordinate(points: MappableAccommodation[]): CoordinateGroup[] {
  const groups = new Map<string, CoordinateGroup>();
  for (const p of points) {
    const key = `${p.lat},${p.lon}`;
    const existing = groups.get(key);
    if (existing) existing.items.push(p);
    else groups.set(key, { lat: p.lat, lon: p.lon, items: [p] });
  }
  return [...groups.values()];
}

function groupPopupHtml(g: CoordinateGroup): string {
  if (g.items.length === 1) {
    const p = g.items[0];
    return `<div class="space-y-1 text-sm">
      <p class="font-semibold">${escapeHtml(p.name)}</p>
      <p class="text-xs text-gray-500">${escapeHtml(p.address)}</p>
      <a href="${googleMapsUrl(p.lat, p.lon)}" target="_blank" rel="noreferrer" class="text-xs font-medium text-blue-600">Open in Google Maps →</a>
    </div>`;
  }
  const list = g.items
    .map(
      p => `<li class="border-b border-gray-100 py-1 last:border-0">
        <p class="font-medium">${escapeHtml(p.name)}</p>
        <p class="text-[11px] text-gray-500">${escapeHtml(p.address)}</p>
      </li>`
    )
    .join('');
  return `<div class="max-w-[260px] space-y-1 text-sm">
    <p class="font-semibold">${g.items.length} establishments in this area</p>
    <p class="text-xs text-gray-500">Their published addresses aren't precise enough to place them individually.</p>
    <ul class="mt-1 max-h-48 overflow-y-auto">${list}</ul>
    <a href="${googleMapsUrl(g.lat, g.lon)}" target="_blank" rel="noreferrer" class="mt-1 block text-xs font-medium text-blue-600">Open area in Google Maps →</a>
  </div>`;
}

/** Vanilla leaflet.markercluster layer — used for Boracay's ~430 points,
 * where individual react-leaflet Markers would be an unreadable pile. */
function ClusterLayer({ groups }: { groups: CoordinateGroup[] }) {
  const map = useMap();
  useEffect(() => {
    const cluster = L.markerClusterGroup();
    groups.forEach(g => {
      const marker = L.marker([g.lat, g.lon]);
      marker.bindPopup(groupPopupHtml(g), { maxWidth: 280 });
      cluster.addLayer(marker);
    });
    map.addLayer(cluster);
    return () => {
      map.removeLayer(cluster);
    };
  }, [groups, map]);
  return null;
}

function FlyTo({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, 18, { duration: 1 });
  }, [target, map]);
  return null;
}

export default function AccommodationsPage() {
  const { area: areaParam } = useParams<{ area: string }>();
  const [search, setSearch] = useState('');
  const [municipalityFilter, setMunicipalityFilter] = useState('');
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  const isValidArea = areaParam === 'mainland' || areaParam === 'boracay';
  const area = (isValidArea ? areaParam : 'mainland') as Area;

  const all = useMemo(
    () => (accommodationsData as Accommodation[]).filter(a => a.area === area),
    [area]
  );

  const municipalities = useMemo(() => {
    if (area !== 'mainland') return [];
    const set = new Set<string>();
    all.forEach(a => a.municipality && set.add(a.municipality));
    return [...set].sort();
  }, [all, area]);

  const filtered = useMemo(
    () =>
      all.filter(a => {
        if (search && !a.name.toLowerCase().includes(search.toLowerCase()))
          return false;
        if (municipalityFilter && a.municipality !== municipalityFilter)
          return false;
        return true;
      }),
    [all, search, municipalityFilter]
  );

  // Reset to page 1 whenever the visible result set changes shape, so a
  // filter/search doesn't strand the user on a now-empty page.
  useEffect(() => {
    setPage(1);
  }, [search, municipalityFilter, area]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pagedFiltered = useMemo(
    () => filtered.slice((page - 1) * perPage, page * perPage),
    [filtered, page, perPage]
  );

  const mappable = useMemo(
    () =>
      filtered.filter(
        (a): a is MappableAccommodation => a.lat != null && a.lon != null
      ),
    [filtered]
  );

  const groupedMappable = useMemo(
    () => groupByCoordinate(mappable),
    [mappable]
  );

  if (!isValidArea) {
    return <Navigate to='/tourism/accommodations/mainland' replace />;
  }

  return (
    <div className='animate-in fade-in space-y-6 pb-8 duration-500'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbHome href='/' />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href='/tourism'>Tourism</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{AREA_LABELS[area]} Accommodations</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className='bg-kapwa-bg-surface border-kapwa-border-weak rounded-xl border p-6 shadow-sm'>
        <div className='flex items-center gap-3'>
          <MapPinIcon
            aria-hidden='true'
            className='text-kapwa-text-brand h-5 w-5'
          />
          <h1 className='kapwa-heading-lg text-kapwa-text-strong'>
            {AREA_LABELS[area]} Accommodations
          </h1>
        </div>
        <p className='text-kapwa-text-support mt-2 text-sm'>
          {all.length} DOT-listed accommodation establishments in{' '}
          {AREA_LABELS[area]}, Aklan.
        </p>
      </header>

      <div className='flex flex-wrap items-center gap-3'>
        <div className='relative min-w-[220px] flex-1'>
          <SearchIcon className='text-kapwa-text-disabled absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
          <input
            type='text'
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder='Search by name…'
            className='border-kapwa-border-weak bg-kapwa-bg-surface w-full rounded-md border py-2 pr-3 pl-9 text-sm'
          />
        </div>
        {area === 'mainland' && (
          <select
            value={municipalityFilter}
            onChange={e => setMunicipalityFilter(e.target.value)}
            className='border-kapwa-border-weak bg-kapwa-bg-surface text-kapwa-text-strong rounded-md border px-3 py-2 text-sm'
          >
            <option value=''>All municipalities</option>
            {municipalities.map(m => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        )}
        <span className='text-kapwa-text-muted text-xs'>
          {filtered.length} shown
        </span>
      </div>

      <Card className='overflow-hidden p-0' hover={false}>
        <div className='h-[60vh] w-full'>
          <MapContainer
            center={AREA_CENTER[area]}
            zoom={AREA_ZOOM[area]}
            scrollWheelZoom
            className='h-full w-full'
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />
            {area === 'boracay' ? (
              <ClusterLayer groups={groupedMappable} />
            ) : (
              groupedMappable.map(g => (
                <Marker key={`${g.lat}-${g.lon}`} position={[g.lat, g.lon]}>
                  <Tooltip direction='top' offset={[0, -35]}>
                    {g.items.length === 1
                      ? g.items[0].name
                      : `${g.items.length} establishments`}
                  </Tooltip>
                  <Popup>
                    {g.items.length === 1 ? (
                      <div className='space-y-1 text-sm'>
                        <p className='font-semibold'>{g.items[0].name}</p>
                        <p className='text-xs text-gray-500'>
                          {g.items[0].address}
                        </p>
                        <a
                          href={googleMapsUrl(g.lat, g.lon)}
                          target='_blank'
                          rel='noreferrer'
                          className='text-xs font-medium text-blue-600 hover:underline'
                        >
                          Open in Google Maps →
                        </a>
                      </div>
                    ) : (
                      <div className='max-w-[260px] space-y-1 text-sm'>
                        <p className='font-semibold'>
                          {g.items.length} establishments in this area
                        </p>
                        <p className='text-xs text-gray-500'>
                          Their published addresses aren&apos;t precise enough
                          to place them individually.
                        </p>
                        <ul className='mt-1 max-h-48 overflow-y-auto'>
                          {g.items.map(p => (
                            <li
                              key={p.name}
                              className='border-b border-gray-100 py-1 last:border-0'
                            >
                              <p className='font-medium'>{p.name}</p>
                              <p className='text-[11px] text-gray-500'>
                                {p.address}
                              </p>
                            </li>
                          ))}
                        </ul>
                        <a
                          href={googleMapsUrl(g.lat, g.lon)}
                          target='_blank'
                          rel='noreferrer'
                          className='mt-1 block text-xs font-medium text-blue-600 hover:underline'
                        >
                          Open area in Google Maps →
                        </a>
                      </div>
                    )}
                  </Popup>
                </Marker>
              ))
            )}
            <FlyTo target={flyTarget} />
          </MapContainer>
        </div>
      </Card>

      <Card className='overflow-hidden p-0' hover={false}>
        <div className='grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3'>
          {pagedFiltered.map(a => (
            <Card
              key={`${a.name}-${a.address}`}
              hover={false}
              className='border-kapwa-border-weak shadow-xs'
            >
              <CardContent className='space-y-1.5 p-4'>
                <h4 className='text-kapwa-text-strong text-sm leading-tight font-bold'>
                  {a.name}
                </h4>
                <p className='text-kapwa-text-support text-xs leading-relaxed'>
                  {a.address}
                </p>
                <div className='flex items-center gap-2 pt-1'>
                  {a.lat != null && a.lon != null ? (
                    <button
                      type='button'
                      onClick={() =>
                        setFlyTarget([a.lat as number, a.lon as number])
                      }
                      className='text-kapwa-text-brand flex items-center gap-1 text-xs font-medium hover:underline'
                    >
                      <MapPinIcon className='h-3 w-3' /> Show on map
                    </button>
                  ) : (
                    <span className='text-kapwa-text-disabled text-xs italic'>
                      Location unavailable
                    </span>
                  )}
                  {a.geocodePrecision !== 'exact' && a.lat != null && (
                    <span className='text-kapwa-text-disabled text-[10px] tracking-wide uppercase'>
                      ~{a.geocodePrecision}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          resultsPerPage={perPage}
          totalItems={filtered.length}
          onPageChange={setPage}
          onResultsPerPageChange={n => {
            setPerPage(n);
            setPage(1);
          }}
        />
      </Card>

      <p className='text-kapwa-text-disabled text-center text-xs italic'>
        Source:{' '}
        <a
          href='https://aklan.gov.ph/tourism/accommodation/'
          target='_blank'
          rel='noreferrer'
          className='text-kapwa-text-brand not-italic hover:underline'
        >
          Provincial Government of Aklan
        </a>
        . Locations geocoded from published addresses via OpenStreetMap and may
        not be exact.
      </p>
    </div>
  );
}
