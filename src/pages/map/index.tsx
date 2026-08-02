import { useNavigate } from 'react-router-dom';

import type { Feature, FeatureCollection } from 'geojson';
import type { Layer, PathOptions } from 'leaflet';
import { GeoJSON, MapContainer, TileLayer } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';

import { PageHero } from '@/components/layout/PageLayouts';
import { Card } from '@/components/ui/Card';

import { getMunicipalityColor } from '@/lib/municipalityColors';

import municipalitiesBoundaries from '@/data/geo/municipalities-boundaries.json';

interface MunicipalityProperties {
  slug: string;
  name: string;
}

const getPathOptions = (feature?: Feature): PathOptions => {
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

export default function MapPage() {
  const navigate = useNavigate();
  const boundaries = municipalitiesBoundaries as FeatureCollection;
  const municipalities = [...boundaries.features].sort((a, b) =>
    (a.properties as MunicipalityProperties).name.localeCompare(
      (b.properties as MunicipalityProperties).name
    )
  );

  const goToMunicipality = (slug: string) =>
    navigate(`/government/municipalities/municipality-of-${slug}`);

  const onEachFeature = (feature: Feature, layer: Layer) => {
    const props = feature.properties as MunicipalityProperties;
    layer.bindTooltip(props.name, { sticky: true, direction: 'top' });
    layer.on('click', () => goToMunicipality(props.slug));
  };

  return (
    <div className='animate-in fade-in space-y-6 duration-500'>
      <PageHero
        title='Map of Aklan'
        description='An interactive map of all 17 municipalities of the Province of Aklan. Click a municipality to view its government profile.'
      />

      <Card className='overflow-hidden p-0' hover={false}>
        <div className='h-[70vh] w-full'>
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
              data={boundaries}
              style={getPathOptions}
              onEachFeature={onEachFeature}
            />
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
        contributors, ODbL-licensed.
      </p>
    </div>
  );
}
