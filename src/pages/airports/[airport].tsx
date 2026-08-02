import { useEffect, useState } from 'react';

import { Link, useParams } from 'react-router-dom';

import {
  ArrowRight,
  ClockIcon,
  CompassIcon,
  ExternalLinkIcon,
  MapPinIcon,
  MountainIcon,
  PlaneIcon,
  RefreshCwIcon,
} from 'lucide-react';

import { DetailSection } from '@/components/layout/PageLayouts';
import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/navigation/Breadcrumb';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';

import { fetchFlightsData, refetchFlightsData } from '@/lib/flights';
import { formatUpdatedAgo } from '@/lib/flightStatus';
import { fetchWeatherForCity } from '@/lib/weather';

import airports from '@/data/airports.json';
import { WeatherData } from '@/types';
import { AirportSchedule } from '@/types/flights';

import { AirportLocationMap } from './components/AirportLocationMap';
import { FlightBoard } from './components/FlightBoard';

export default function AirportDetail() {
  const { airport: slug } = useParams();
  const airport = airports.find(a => a.slug === slug);

  const [schedule, setSchedule] = useState<AirportSchedule | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!airport) return;
    let cancelled = false;

    setLoading(true);
    setError(null);

    Promise.all([
      fetchFlightsData(),
      fetchWeatherForCity(airport.weatherCity).catch(() => null),
    ])
      .then(([flightsData, weatherData]) => {
        if (cancelled) return;
        const airportSchedule =
          flightsData.airports.find(a => a.slug === airport.slug) ?? null;
        setSchedule(airportSchedule);
        setUpdatedAt(flightsData.updatedAt);
        setWeather(weatherData);
      })
      .catch(err => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to load flight data'
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [airport]);

  if (!airport) {
    return <div className='p-20 text-center'>Airport not found</div>;
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const flightsData = await refetchFlightsData();
      const airportSchedule =
        flightsData.airports.find(a => a.slug === airport.slug) ?? null;
      setSchedule(airportSchedule);
      setUpdatedAt(flightsData.updatedAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className='animate-in fade-in space-y-6 pb-8 duration-500'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbHome href='/' />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href='/airports'>Airports</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{airport.iata}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* --- HEADER --- */}
      <header className='bg-kapwa-bg-surface border-kapwa-border-weak rounded-xl border p-6 shadow-sm'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <div className='border-kapwa-border-brand bg-kapwa-bg-brand-weak text-kapwa-text-brand rounded-full border-2 p-2.5'>
              <PlaneIcon className='h-5 w-5' />
            </div>
            <div>
              <h1 className='kapwa-heading-lg text-kapwa-text-strong'>
                {airport.name}
              </h1>
              <p className='text-kapwa-text-support text-sm'>
                {airport.municipality}, Aklan, Philippines
              </p>
            </div>
          </div>
          <div className='flex gap-2'>
            <Badge variant='primary' dot>
              IATA {airport.iata}
            </Badge>
            <Badge variant='slate'>ICAO {airport.icao}</Badge>
          </div>
        </div>
      </header>

      {/* --- INFO + WEATHER + MAP --- */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <StatCard
          label='Elevation'
          value={`${airport.elevationFeet} ft`}
          subtext={`${airport.elevationMeters} m above sea level`}
          icon={MountainIcon}
          variant='slate'
        />
        <StatCard
          label='Time Zone'
          value='GMT+8'
          subtext={airport.timezone}
          icon={ClockIcon}
          variant='slate'
        />
        <StatCard
          label='Weather'
          value={weather ? `${weather.temperature}°C` : '—'}
          subtext={weather ? weather.condition : 'Loading…'}
          icon={CompassIcon}
          variant='primary'
        />
      </div>

      <AirportLocationMap
        latitude={airport.latitude}
        longitude={airport.longitude}
        name={airport.name}
        className='border-kapwa-border-weak h-64 w-full overflow-hidden rounded-xl border shadow-sm md:h-80'
      />

      {/* --- CROSS-LINKS --- */}
      <div className='flex flex-wrap gap-3'>
        <Link
          to={`/government/municipalities/municipality-of-${airport.municipalitySlug}`}
          className='border-kapwa-border-weak bg-kapwa-bg-surface hover:border-kapwa-border-brand hover:text-kapwa-text-brand text-kapwa-text-support flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-bold transition-colors'
        >
          <MapPinIcon className='h-4 w-4' />
          {airport.municipality} Government Profile
          <ArrowRight className='h-3.5 w-3.5' />
        </Link>
        <Link
          to={`/tourism/${airport.municipalitySlug}`}
          className='border-kapwa-border-weak bg-kapwa-bg-surface hover:border-kapwa-border-brand hover:text-kapwa-text-brand text-kapwa-text-support flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-bold transition-colors'
        >
          <CompassIcon className='h-4 w-4' />
          Explore {airport.municipality} Tourism
          <ArrowRight className='h-3.5 w-3.5' />
        </Link>
      </div>

      {/* --- FLIGHT BOARD --- */}
      <DetailSection
        title={
          <div className='flex w-full items-center justify-between'>
            <div className='flex items-center gap-2'>
              <span className='relative flex h-2 w-2'>
                <span className='bg-kapwa-bg-success-default absolute inline-flex h-full w-full animate-ping rounded-full opacity-75' />
                <span className='bg-kapwa-bg-success-default relative inline-flex h-2 w-2 rounded-full' />
              </span>
              Flight Schedule
            </div>
            <div className='flex items-center gap-3 normal-case'>
              {updatedAt && (
                <span className='text-kapwa-text-disabled text-[10px] font-medium'>
                  Updated {formatUpdatedAgo(updatedAt)}
                </span>
              )}
              <button
                type='button'
                onClick={handleRefresh}
                disabled={refreshing}
                className='text-kapwa-text-brand flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase hover:underline disabled:opacity-50'
              >
                <RefreshCwIcon
                  className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`}
                />
                Refresh
              </button>
            </div>
          </div>
        }
        icon={PlaneIcon}
      >
        {loading ? (
          <div className='space-y-3'>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className='bg-kapwa-bg-surface-raised h-20 animate-pulse rounded-xl'
              />
            ))}
          </div>
        ) : error ? (
          <div className='border-kapwa-border-danger bg-kapwa-bg-danger-weak text-kapwa-text-danger rounded-xl border p-6 text-center text-sm'>
            {error}
          </div>
        ) : (
          <FlightBoard flights={schedule?.flights ?? []} />
        )}
      </DetailSection>

      <p className='text-kapwa-text-disabled text-center text-xs italic'>
        Flight data via{' '}
        <a
          href='https://aerodatabox.com/'
          target='_blank'
          rel='noreferrer'
          className='text-kapwa-text-brand not-italic hover:underline'
        >
          AeroDataBox
          <ExternalLinkIcon className='ml-1 inline h-3 w-3' />
        </a>
        . Schedules may change without notice — confirm with your airline
        before traveling.
      </p>
    </div>
  );
}
