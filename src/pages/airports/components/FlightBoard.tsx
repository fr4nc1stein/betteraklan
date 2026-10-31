import { useMemo, useState } from 'react';

import { PlaneLandingIcon, PlaneTakeoffIcon, RadarIcon } from 'lucide-react';

import { NormalizedFlight } from '@/types/flights';

import { FlightRow } from './FlightRow';

type FilterKey = 'all' | 'departure' | 'arrival';

const FILTERS: { key: FilterKey; label: string; icon: typeof RadarIcon }[] = [
  { key: 'all', label: 'All', icon: RadarIcon },
  { key: 'departure', label: 'Departures', icon: PlaneTakeoffIcon },
  { key: 'arrival', label: 'Arrivals', icon: PlaneLandingIcon },
];

export function FlightBoard({ flights }: { flights: NormalizedFlight[] }) {
  const [filter, setFilter] = useState<FilterKey>('all');

  const filtered = useMemo(
    () =>
      filter === 'all' ? flights : flights.filter(f => f.direction === filter),
    [flights, filter]
  );

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap gap-2'>
        {FILTERS.map(({ key, label, icon: Icon }) => {
          const count =
            key === 'all'
              ? flights.length
              : flights.filter(f => f.direction === key).length;
          const active = filter === key;
          return (
            <button
              key={key}
              type='button'
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold tracking-wide uppercase transition-colors ${
                active
                  ? 'bg-kapwa-bg-brand-default border-kapwa-border-brand text-kapwa-text-inverse'
                  : 'border-kapwa-border-weak bg-kapwa-bg-surface text-kapwa-text-support hover:border-kapwa-border-brand'
              }`}
            >
              <Icon className='h-3.5 w-3.5' />
              {label}
              <span
                className={
                  active
                    ? 'text-kapwa-text-inverse/70'
                    : 'text-kapwa-text-disabled'
                }
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className='border-kapwa-border-weak text-kapwa-text-disabled rounded-xl border border-dashed p-10 text-center text-sm'>
          No flights in this window.
        </div>
      ) : (
        <div className='space-y-3'>
          {filtered.map((flight, i) => (
            <FlightRow
              key={`${flight.direction}-${flight.flightNumber}-${flight.scheduledLocal}`}
              flight={flight}
              style={{ animationDelay: `${Math.min(i, 12) * 40}ms` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
